import { Link } from "react-router-dom";
import LegalPageLayout from "../components/LegalPageLayout";

const CONTACT_EMAIL = "grandpick.app@gmail.com";

function Privacy() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="POLÍTICA DE PRIVACIDAD"
      subtitle="Cómo tratamos tus datos en GrandPick"
      lastUpdated="3 de noviembre de 2026"
    >
      <h2>1. Quiénes somos</h2>
      <p>
        GrandPick es un juego de predicciones de Fórmula 1 para fans, de uso
        gratuito. <strong>GrandPick no está afiliado, asociado, autorizado,
        respaldado por, ni conectado de ninguna forma oficial con la Fórmula
        1, la FIA, Liberty Media, ni con ningún equipo o piloto.</strong> Los
        nombres, siglas, colores de equipo y demás referencias a la F1 se
        usan únicamente con fines informativos y de entretenimiento para
        fans.
      </p>

      <h2>2. Qué datos recolectamos</h2>
      <p>Cuando creás una cuenta y usás GrandPick, guardamos:</p>
      <ul>
        <li>
          <strong>Datos de cuenta</strong>: nombre, apellido, email, país,
          contraseña (nunca se guarda en texto plano, se guarda
          cifrada/hasheada) y, si la subís, una foto de perfil.
        </li>
        <li>
          <strong>Datos de dispositivo</strong>: un identificador de
          notificaciones push (si activás las notificaciones), para poder
          enviarte avisos de la app.
        </li>
        <li>
          <strong>Datos de actividad</strong>: tus predicciones, puntos
          obtenidos y posición en el ranking — es decir, tu uso del juego.
        </li>
      </ul>
      <p>
        No te pedimos documento de identidad, datos de tarjetas ni ningún
        dato de pago: <strong>por el momento GrandPick no procesa pagos ni
        suscripciones</strong>. La forma prevista de monetizar la app es a
        través de <strong>publicidad</strong> (avisos mostrados en el sitio,
        no venta de tus datos personales).
      </p>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>
          Crear y mantener tu cuenta, y mostrar tus predicciones/puntos/
          ranking.
        </li>
        <li>
          Enviarte mails necesarios para el funcionamiento de la cuenta (por
          ejemplo, recuperar tu contraseña).
        </li>
        <li>
          Enviarte notificaciones push sobre la app, si las activaste
          (apertura de predicciones, resultados, novedades). Podés
          desactivarlas en cualquier momento desde los permisos de tu
          navegador/dispositivo.
        </li>
        <li>Mejorar el funcionamiento del juego.</li>
        <li>
          Mostrarte publicidad para poder mantener GrandPick gratis (ver
          punto 9).
        </li>
      </ul>
      <p>
        No vendemos tus datos de cuenta (nombre, email, predicciones) a
        terceros. Si en el futuro mostramos avisos publicitarios, el
        proveedor que los gestione puede usar sus propias cookies o
        identificadores para eso — lo vamos a detallar acá apenas se active.
      </p>

      <h2>4. Con quién compartimos datos (proveedores que usamos)</h2>
      <p>
        Para que GrandPick funcione, algunos datos pasan por estos
        proveedores, que actúan como encargados del tratamiento (no los usan
        para sus propios fines):
      </p>
      <ul>
        <li><strong>MongoDB Atlas</strong>: donde vive la base de datos.</li>
        <li>
          <strong>Cloudinary</strong>: almacenamiento de imágenes (fotos de
          perfil, logos).
        </li>
        <li>
          <strong>Firebase (Google)</strong>: envío de notificaciones push.
        </li>
        <li>
          <strong>Resend</strong>: envío de mails (por ejemplo,
          recuperación de contraseña).
        </li>
        <li>
          <strong>Railway</strong> y <strong>Vercel</strong>: hosting del
          servidor y del sitio.
        </li>
      </ul>
      <p>
        Si en el futuro sumamos un proveedor de publicidad, lo vamos a
        nombrar acá. A diferencia de los anteriores, ese tipo de proveedor
        generalmente no actúa solo como encargado — también puede usar datos
        del navegador (cookies, dirección IP, qué páginas visitás) para
        elegir qué anuncio mostrarte y para sus propias métricas (ver punto
        9). Estos proveedores pueden procesar datos en servidores fuera de
        Argentina.
      </p>

      <h2>5. Cuánto tiempo guardamos tus datos</h2>
      <p>
        Mientras tu cuenta esté activa. Si pedís que la eliminemos (ver
        punto 6), borramos tus datos personales en un plazo razonable, salvo
        que tengamos que conservar algo por una obligación legal.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        De acuerdo a la Ley 25.326 de Protección de Datos Personales
        (Argentina), podés pedirnos en cualquier momento:
      </p>
      <ul>
        <li><strong>Acceder</strong> a los datos que tenemos sobre vos.</li>
        <li><strong>Corregir</strong> datos incorrectos o desactualizados.</li>
        <li><strong>Eliminar</strong> tu cuenta y tus datos personales.</li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escribinos a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>7. Menores de edad</h2>
      <p>
        GrandPick no está dirigido a menores de 13 años. Si sabemos que una
        cuenta pertenece a alguien por debajo de esa edad sin consentimiento
        de un adulto responsable, la cuenta puede ser eliminada.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Tomamos medidas razonables para proteger tus datos (por ejemplo, las
        contraseñas nunca se guardan en texto plano). Ningún sistema es 100%
        infalible; si detectamos un incidente que afecte tus datos, te vamos
        a avisar.
      </p>

      <h2>9. Cookies y publicidad</h2>
      <p>
        Usamos almacenamiento local del navegador (<strong>localStorage</strong>)
        para mantener tu sesión iniciada — eso no es una cookie de rastreo,
        solo sirve para que no tengas que loguearte en cada visita.
      </p>
      <p>
        GrandPick prevé financiarse mostrando avisos publicitarios de
        terceros en el futuro. Cuando eso esté activo, el proveedor de esos
        avisos puede instalar sus propias cookies o tecnologías similares en
        tu navegador para elegir qué anuncio mostrarte y medir su
        desempeño, de forma independiente a GrandPick. En ese momento vamos
        a detallar acá cómo gestionar esas preferencias.
      </p>

      <h2>10. Cambios a esta política</h2>
      <p>
        Si cambiamos esta política de forma relevante, te lo vamos a
        notificar dentro de la app.
      </p>

      <h2>11. Contacto</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <div className="legal-page__footer-link">
        <p>
          Ver también los <Link to="/terminos">Términos y Condiciones</Link>.
        </p>
      </div>
    </LegalPageLayout>
  );
}

export default Privacy;
