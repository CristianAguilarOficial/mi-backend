import nodemailer from "nodemailer";

// Crear un transporter (usando variables de entorno en producción)
const transporter = nodemailer.createTransport({
  service: "gmail", // Puedes usar otros servicios como SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER || "mikeloxo060@gmail.com",
    pass: process.env.EMAIL_PASS || "sfnhejdkosdbdkwz",
  },
});

export const sendVerificationEmail = async (to, token) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationLink = `${frontendUrl}/verify-email/${token}`;

    const mailOptions = {
      from: `"Sistema de Tareas" <${
        process.env.EMAIL_USER || "mikeloxo060@gmail.com"
      }>`,
      to,
      subject: "Verifica tu cuenta",
      html: `
        <div>
          <h1>Verifica tu cuenta</h1>
          <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Verificar cuenta</a>
          <p>Si no solicitaste esta verificación, puedes ignorar este correo.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
export const sendPasswordResetEmail = async (to, token) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    const mailOptions = {
      from: `"Sistema de Tareas" <${
        process.env.EMAIL_USER || "mikeloxo060@gmail.com"
      }>`,
      to,
      subject: "Restablecimiento de contraseña",
      html: `
        <div>
          <h1>Restablecimiento de contraseña</h1>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email de restablecimiento enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar email de restablecimiento:", error);
    return false;
  }
};
