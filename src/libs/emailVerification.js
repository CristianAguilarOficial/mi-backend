//emailverification
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Genera un token de verificación de email
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Genera un JWT token que contiene el id y el token de verificación
export function createVerificationToken(userId, verificationToken) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { id: userId, token: verificationToken },
      TOKEN_SECRET,
      {
        expiresIn: "24h", // El token expira en 24 horas
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}

// Verifica el token JWT de verificación de email
export function verifyEmailToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
}
