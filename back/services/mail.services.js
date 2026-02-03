import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendResetPassword({ email, token }) {

  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP ERROR:", error);
    } else {
      console.log("SMTP READY");
    }
  });
  
  console.log("MAIL_USER:", process.env.MAIL_USER);
  console.log("MAIL_PASS:", process.env.MAIL_PASS ? "OK" : "MISSING");

  const link = `http://localhost:2022/reset-password?token=${token}`;

 /*  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.MAIL_USER,
    subject: "TEST MAIL",
    text: "Si recibís esto, Nodemailer funciona",
  }); */

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
