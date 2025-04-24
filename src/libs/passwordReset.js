// src/libs/passwordReset.js
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Genera un token de restablecimiento de contraseña
export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Crea un JWT que contiene el id del usuario y el token de restablecimiento
export function createPasswordResetToken(userId, resetToken) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { id: userId, token: resetToken },
      TOKEN_SECRET,
      {
        expiresIn: "1h", // El token expira en 1 hora
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}

// Verifica el token JWT de restablecimiento
export function verifyResetToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
}
