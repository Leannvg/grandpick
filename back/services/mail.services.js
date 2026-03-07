import nodemailer from "nodemailer";
const FRONT_URL = process.env.FRONT_URL;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Verificar conexión al inicio
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection error:", error);
  } else {
    console.log("✅ SMTP connection ready");
  }
});

export async function sendResetPassword({ email, token }) {

  const link = `${FRONT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Soporte GrandPick" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Recuperar contraseña",
    html: `
      <p>Solicitaste recuperar tu contraseña.</p>
      <p>Hacé click en el siguiente enlace (válido por 15 minutos):</p>
      <a href="${link}">${link}</a>
      <p>Si no fuiste vos, ignorá este mensaje.</p>
    `,
  });
}
