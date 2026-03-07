import nodemailer from "nodemailer";
const FRONT_URL = process.env.FRONT_URL;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Usamos puerto 465 para SSL/TLS (suele ser más estable en Railway/Vercel)
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10000, // 10 segundos de timeout
  greetingTimeout: 5000,
  socketTimeout: 15000,
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
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Configuración de correo (MAIL_USER / MAIL_PASS) no detectada.");
  }

  if (!FRONT_URL) {
    throw new Error("FRONT_URL no definido en las variables de entorno.");
  }

  const link = `${FRONT_URL}/reset-password?token=${token}`;

  try {
    const fromAddress = process.env.MAIL_USER.includes("@")
      ? `"Soporte GrandPick" <${process.env.MAIL_USER}>`
      : `"Soporte GrandPick" <no-reply@grandpick.app>`;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Recuperar contraseña",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e10600;">Recuperar contraseña</h2>
          <p>Solicitaste recuperar tu contraseña en <strong>GrandPick</strong>.</p>
          <p>Hacé click en el siguiente botón (válido por 15 minutos):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #e10600; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">RESTABLECER CONTRASEÑA</a>
          </div>
          <p style="color: #666; font-size: 0.9em;">Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:</p>
          <p style="color: #666; font-size: 0.8em; word-break: break-all;">${link}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
          <p style="color: #999; font-size: 0.8em;">Si no solicitaste este cambio, simplemente ignorá este mensaje.</p>
        </div>
      `,
    });
    console.log(`✅ Mail enviado con éxito a ${email}`);
  } catch (error) {
    console.error(`❌ Error en transporter.sendMail a ${email}:`, error);
    throw new Error(`Error al enviar el correo: ${error.message}`);
  }
}
