import { Resend } from 'resend';

export async function sendResetPassword({ email, token }) {
  const FRONT_URL = process.env.FRONT_URL;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

  if (!RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY no detectada en las variables de entorno.");
    throw new Error("Configuración de correo incompleta.");
  }

  if (!FRONT_URL) {
    console.error("❌ FRONT_URL no definido en las variables de entorno.");
    throw new Error("Configuración de redirección incompleta.");
  }

  const resend = new Resend(RESEND_API_KEY);
  const link = `${FRONT_URL}/reset-password?token=${token}`;

  try {
    console.log(`📩 Intentando enviar mail de recuperación a ${email} vía Resend API...`);

    const { data, error } = await resend.emails.send({
      from: 'GrandPick <noreply@grandpick.app>',
      to: [email],
      subject: 'Recuperar contraseña - GrandPick',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperar Contraseña - GrandPick</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #081D2B; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #081D2B; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0A2434; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  
                  <!-- Header / Logo Area -->
                  <tr>
                    <td align="center" style="padding: 40px 0 20px 0; background-image: linear-gradient(to bottom, #3975A2, #0A2434);">
                      <img src="https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_200/grandpick/logo.png" alt="GrandPick Logo" style="display: block; width: 200px; max-width: 100%; border: 0;" />
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #ffffff; text-align: center;">
                        ¿Olvidaste tu contraseña?
                      </h2>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #d1d1d1; text-align: center;">
                        No te preocupes, nos pasa a todos. Solicitaron un restablecimiento de contraseña para tu cuenta de <strong>GrandPick</strong>.
                      </p>
                      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #d1d1d1; text-align: center;">
                        Hacé click en el botón de abajo para elegir una nueva contraseña. Este enlace es válido por 15 minutos.
                      </p>

                      <!-- Action Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px 0;">
                            <a href="${link}" style="background-color: #D40000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; transition: background-color 0.3s;">
                              Restablecer mi contraseña
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0; font-size: 14px; color: #999; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px;">
                        ¿El botón no funciona? Copiá y pegá este enlace en tu navegador:<br>
                        <a href="${link}" style="color: #3975A2; word-break: break-all; font-size: 12px;">${link}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 20px 30px 40px 30px; background-color: #08121a;">
                      <p style="margin: 0; font-size: 12px; color: #d0d0d0;">
                        Si no solicitaste este cambio, podés ignorar este correo con seguridad. No se realizarán cambios en tu cuenta.
                      </p>
                      <p style="margin: 20px 0 0 0; font-size: 12px; color: #d0d0d0; text-transform: uppercase; letter-spacing: 1px;">
                        © 2026 GrandPick - Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Error devuelto por Resend:", error);
      throw new Error(error.message);
    }

    console.log(`✅ Mail enviado con éxito vía Resend. ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error(`❌ Error crítico enviando mail a ${email}:`, error);
    throw new Error(`Error al enviar el correo: ${error.message}`);
  }
}

