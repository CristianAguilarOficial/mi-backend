import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import {
  generateVerificationToken,
  createVerificationToken,
  verifyEmailToken,
} from "../libs/emailVerification.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/mail.service.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import {
  generateResetToken,
  createPasswordResetToken,
  verifyResetToken,
} from "../libs/passwordReset.js";

// REGISTER USER
export const register = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    // Check if user already exists
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: "The email is already in use" });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 24); // Token válido por 24 horas

    // Create user with verification data
    const newUser = new User({
      username,
      email,
      password: passwordHash,
      verified: false,
      verificationToken,
      verificationTokenExpires: expiresIn,
    });

    const userSaved = await newUser.save();

    // Generate JWT token for email verification
    const emailToken = await createVerificationToken(
      userSaved._id,
      verificationToken
    );

    // Send verification email
    const emailSent = await sendVerificationEmail(email, emailToken);

    if (!emailSent) {
      // Si falla el envío del correo, registrar error pero continuar
      console.error("Failed to send verification email");
    }

    // Send response without setting login cookie (usuario debe verificar primero)
    return res.status(201).json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      message:
        "Registration successful! Please check your email to verify your account.",
      verified: false,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if account is verified
    if (!userFound.verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        verified: false,
      });
    }

    // Compare password
    const isMatch = await bcryptjs.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Create token
    const token = await createAccessToken({ id: userFound._id });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Send response
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      verified: userFound.verified,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Add email verification endpoint
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = await verifyEmailToken(token);

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Check if user is already verified
    if (user.verified) {
      return res.status(200).json({
        message: "El correo ya ha sido verificado. Puedes iniciar sesión.",
      });
    }

    // Check if token matches and is not expired
    if (
      user.verificationToken !== decoded.token ||
      !user.verificationTokenExpires ||
      new Date() > user.verificationTokenExpires
    ) {
      return res
        .status(400)
        .json({ message: "Token de verificación inválido o expirado" });
    }

    // Update user to verified
    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.status(200).json({
      message: "¡Correo verificado exitosamente! Ahora puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error de verificación de correo:", error);
    return res
      .status(500)
      .json({ message: "Error al verificar el correo electrónico" });
  }
};

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id).select("-password");
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(userFound);
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: error.message });
  }
};
// LOGOUT USER
export const logout = (req, res) => {
  res.cookie("token", "", {
    // Usar string vacío en lugar de 'token' indefinido
    sameSite: "none",
    secure: true,
    httpOnly: true,
    expires: new Date(0), // Expirar la cookie inmediatamente
  });
  return res.sendStatus(200);
};
export const verifyToken = (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const userFound = await User.findById(decoded.id).select("-password");
      if (!userFound) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return res.json(userFound);
    } catch (error) {
      console.error("Verify token error:", error);
      return res.status(500).json({ message: error.message });
    }
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Buscar el usuario
    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no informamos si el correo existe o no
      return res.status(200).json({
        message:
          "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña",
      });
    }

    // Generar token de restablecimiento
    const resetToken = generateResetToken();
    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 1); // Token válido por 1 hora

    // Guardar token en el usuario
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiresIn;
    await user.save();

    // Generar JWT para el enlace
    const resetJWT = await createPasswordResetToken(user._id, resetToken);

    // Enviar correo
    const emailSent = await sendPasswordResetEmail(email, resetJWT);

    if (!emailSent) {
      console.error("Failed to send password reset email");
    }

    return res.status(200).json({
      message:
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verificar el token
    const decoded = await verifyResetToken(token);

    // Buscar el usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el token coincida y no haya expirado
    if (
      user.resetPasswordToken !== decoded.token ||
      !user.resetPasswordExpires ||
      new Date() > user.resetPasswordExpires
    ) {
      return res.status(400).json({
        message: "El enlace de restablecimiento es inválido o ha expirado",
      });
    }

    // Actualizar contraseña
    const passwordHash = await bcryptjs.hash(password, 10);
    user.password = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ message: "Error al restablecer la contraseña" });
  }
};

// Verificar validez del token de reset
export const verifyResetPasswordToken = async (req, res) => {
  const { token } = req.params;

  try {
    // Verificar el token
    const decoded = await verifyResetToken(token);

    // Buscar el usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ valid: false, message: "Token inválido" });
    }

    // Verificar que el token coincida y no haya expirado
    if (
      user.resetPasswordToken !== decoded.token ||
      !user.resetPasswordExpires ||
      new Date() > user.resetPasswordExpires
    ) {
      return res
        .status(400)
        .json({ valid: false, message: "Token inválido o expirado" });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return res.status(400).json({ valid: false, message: "Token inválido" });
  }
};
