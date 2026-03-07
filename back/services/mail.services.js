// import { Resend } from 'resend';

export async function sendResetPassword({ email, token }) {
  console.log(`[MAIL STUB] Se solicitó recuperación de contraseña para ${email}. Token: ${token}`);
  console.log(`[MAIL STUB] Como el sistema de mails está desactivado, no se envió nada.`);

  /*
  const FRONT_URL = process.env.FRONT_URL;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY no detectada en las variables de entorno.");
  }

  if (!FRONT_URL) {
    throw new Error("FRONT_URL no definido en las variables de entorno.");
  }

  const resend = new Resend(RESEND_API_KEY);
  const link = `${FRONT_URL}/reset-password?token=${token}`;

  try {
    console.log(` Intentando enviar mail de recuperación a ${email} vía Resend API...`);

    const { data, error } = await resend.emails.send({
      from: 'GrandPick <onboarding@resend.dev>', // Ver nota sobre dominios personalizados
      to: [email],
      subject: 'Recuperar contraseña - GrandPick',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e10600;">Recuperar contraseña</h2>
          <p>Solicitaste recuperar tu contraseña en <strong>GrandPick</strong>.</p>
          <p>Hacé click en el siguiente botón (válido por 15 minutos):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${link}" style="background-color: #e10600; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">RESTABLECER CONTRASEÑA</a>
          </div>
          <p style="color: #666; font-size: 0.9em;">Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:</p>
          <p style="color: #666; font-size: 0.8em; word-break: break-all;">\${link}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
          <p style="color: #999; font-size: 0.8em;">Si no solicitaste este cambio, simplemente ignorá este mensaje.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Error devuelto por Resend:", error);
      throw new Error(error.message);
    }

    console.log(`✅ Mail enviado con éxito vía Resend. ID: \${data.id}`);
  } catch (error) {
    console.error(`❌ Error crítico enviando mail a \${email}:`, error);
    throw new Error(`Error al enviar el correo: \${error.message}`);
  }
  */
}
