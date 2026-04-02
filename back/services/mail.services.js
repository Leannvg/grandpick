import { Resend } from 'resend';

export async function sendResetPassword({ email, token }) {
  const FRONT_URL = process.env.FRONT_URL;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

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
                      <img src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20379.57%20120.64'%3e%3cdefs%3e%3cstyle%3e.cls-1{fill:%23d40000;}.cls-2{fill:%23fff;}%3c/style%3e%3c/defs%3e%3cg%20id='Capa_2'%20data-name='Capa%202'%3e%3cg%20id='Capa_1-2'%20data-name='Capa%201'%3e%3cpath%20class='cls-1'%20d='M0,.36l65.2,0V23.4L23,23.38Z'/%3e%3cpath%20class='cls-1'%20d='M30.71,31.34H65.2v23.1H53.81Z'/%3e%3cpath%20class='cls-1'%20d='M65.82,66.43l118.55.33V89.85l-95.15,0Z'/%3e%3cpath%20class='cls-1'%20d='M96.61,97.53l87.76-.29v23.1l-64.66,0Z'/%3e%3cpath%20class='cls-2'%20d='M130,12.64H102.88q-6.64,0-9.08,2.61t-2.42,8.61v8.07c0,4.24.79,7.24,2.39,9s4.32,2.64,8.18,2.64h8.71q4,0,5.76-1.18a4.22,4.22,0,0,0,1.75-3.75V33.93H103.74V22.65H131V39.58q0,8-5.4,11.79t-15.47,3.78h-7.78q-13.08,0-19.54-6.28T76.37,31.36V23.72A26,26,0,0,1,78,14.25,18.88,18.88,0,0,1,82.87,7,22,22,0,0,1,91,2.46,35.72,35.72,0,0,1,102.16.86H130Z'/%3e%3cpath%20class='cls-2'%20d='M137.1,54.44V27.72a4.25,4.25,0,0,1,1.28-3.22,4.32,4.32,0,0,1,3.08-1.21H168.1c2,0,3.3-.31,4-.93s1.11-2.05,1.11-4.29v-.35q0-3.15-1.11-4.11c-.74-.64-2.08-1-4-1H122.81V.86h44.94a42.23,42.23,0,0,1,7.5.64,18.29,18.29,0,0,1,6.18,2.21A11.94,11.94,0,0,1,185.61,8a13.22,13.22,0,0,1,1.57,6.75v3.35a16.3,16.3,0,0,1-1.36,7.11A11,11,0,0,1,182,29.65,16.29,16.29,0,0,1,176,32a42.39,42.39,0,0,1-7.86.68h-.78l19.79,21.79H170.39L150.67,32.93V54.44Z'/%3e%3cpath%20class='cls-2'%20d='M232.9,43.22H207.82l-4.28,11.22H189.11L206.9,11.22A24.72,24.72,0,0,1,212,3.07C214,1,216.82,0,220.4,0s6.63,1,8.75,3a22.48,22.48,0,0,1,5.18,8L252,54.44H237.11ZM212.11,32.15h16.57l-6.93-18.36a5.82,5.82,0,0,0-.46-.9.9.9,0,0,0-.82-.39,1,1,0,0,0-.79.36,3.66,3.66,0,0,0-.5.93Z'/%3e%3cpath%20class='cls-2'%20d='M257,15.15a16.53,16.53,0,0,1,1.22-6.51,14.35,14.35,0,0,1,3.18-4.75A13.43,13.43,0,0,1,266,1a15.65,15.65,0,0,1,5.54-1q6.85,0,10.75,3.68a27,27,0,0,1,6.32,9.68l11.65,28.43c.14.34.3.66.46,1a.86.86,0,0,0,.82.46,1.07,1.07,0,0,0,1-.39,2,2,0,0,0,.25-1.11V.86h14.29V40.22a16.9,16.9,0,0,1-1.22,6.65,14.35,14.35,0,0,1-3.18,4.75A12.49,12.49,0,0,1,308,54.44a16.78,16.78,0,0,1-5.54.93q-6.86,0-10.68-3.58A27.51,27.51,0,0,1,285.41,42L273.76,13.57a10.59,10.59,0,0,0-.46-1,.87.87,0,0,0-.82-.47,1.07,1.07,0,0,0-1,.4,2.12,2.12,0,0,0-.25,1.11V54.44H257Z'/%3e%3cpath%20class='cls-2'%20d='M365.31,2.46a21.26,21.26,0,0,1,8,4.58A18.46,18.46,0,0,1,378,14.25a27.11,27.11,0,0,1,1.58,9.47v7.86A27.05,27.05,0,0,1,378,41a18.5,18.5,0,0,1-4.71,7.22,21.11,21.11,0,0,1-8,4.57,35.38,35.38,0,0,1-11.18,1.61H326.34V.86h27.79A35.39,35.39,0,0,1,365.31,2.46Zm-24.68,9.68v31h12.22q7.06,0,9.39-2.64t2.32-9.08V23.79q0-6.43-2.28-9c-1.53-1.74-4.55-2.61-9.08-2.61Z'/%3e%3cpath%20class='cls-2'%20d='M244.47,87.49q0,8.73-5.28,12t-16.36,3.28H210.32v17.86H196V67.06h26.79q11.07,0,16.36,3.5t5.28,11.65Zm-14.28-4.64A5,5,0,0,0,228.65,79q-1.53-1.39-5.39-1.4H210.32V92.28h12.94q3.86,0,5.39-1.39a4.91,4.91,0,0,0,1.54-3.82Z'/%3e%3cpath%20class='cls-2'%20d='M252,67.06h14.28v53.58H252Z'/%3e%3cpath%20class='cls-2'%20d='M320.63,120.64H299.91A35.72,35.72,0,0,1,288.7,119a22,22,0,0,1-8.08-4.58,18.88,18.88,0,0,1-4.85-7.21,26,26,0,0,1-1.65-9.47V89.92a26,26,0,0,1,1.65-9.46,18.91,18.91,0,0,1,4.85-7.22,22,22,0,0,1,8.08-4.57,35.71,35.71,0,0,1,11.21-1.61h20.36V78.85H300.63q-6.64,0-9.08,2.61t-2.43,8.61v7.57q0,6,2.51,8.61t9.35,2.61h19.65Z'/%3e%3cpath%20class='cls-2'%20d='M327.06,67.06h14.29V87.64H344a7.76,7.76,0,0,0,3.36-.57A8.72,8.72,0,0,0,350,84.49l12.93-17.43H379L358.64,93.21l20.93,27.43h-16.5l-12.58-17a12.67,12.67,0,0,0-3-3.21,6.4,6.4,0,0,0-3.46-.79h-2.64v21H327.06Z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e" alt="GrandPick Logo" width="200" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
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

