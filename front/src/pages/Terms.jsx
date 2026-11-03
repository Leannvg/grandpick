import { Link } from "react-router-dom";
import LegalPageLayout from "../components/LegalPageLayout";

const CONTACT_EMAIL = "grandpick.app@gmail.com";

function Terms() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="TÉRMINOS Y CONDICIONES"
      subtitle="Las reglas de uso de GrandPick"
      lastUpdated="3 de noviembre de 2026"
    >
      <h2>1. Aceptación</h2>
      <p>
        Al crear una cuenta en GrandPick, aceptás estos Términos y la{" "}
        <Link to="/privacidad">Política de Privacidad</Link>.
      </p>

      <h2>2. Qué es GrandPick</h2>
      <p>
        GrandPick es un juego de predicciones de Fórmula 1{" "}
        <strong>sin fines de apuesta ni dinero real</strong>: no se cobra
        para jugar, no se pagan premios en dinero, y los puntos/ranking son
        solo para entretenimiento entre usuarios. Por el momento GrandPick{" "}
        <strong>no procesa pagos ni suscripciones</strong>; la app se
        sostiene (o prevé sostenerse) mediante <strong>publicidad</strong>{" "}
        mostrada en el sitio.
      </p>

      <h2>3. Tu cuenta</h2>
      <p>
        Sos responsable de mantener la confidencialidad de tu contraseña y
        de toda actividad que ocurra con tu cuenta. Avisanos si creés que
        alguien accedió a tu cuenta sin tu permiso.
      </p>

      <h2>4. Uso aceptable</h2>
      <p>No está permitido:</p>
      <ul>
        <li>Crear múltiples cuentas para manipular el ranking o los puntos.</li>
        <li>
          Intentar vulnerar la seguridad de la plataforma, acceder a datos de
          otros usuarios, o interferir con el funcionamiento del servicio.
        </li>
        <li>
          Subir contenido (ej. foto de perfil) que sea ilegal, ofensivo, o
          que infrinja derechos de terceros.
        </li>
        <li>Usar la plataforma para hacerse pasar por otra persona.</li>
      </ul>
      <p>El incumplimiento puede resultar en el bloqueo o eliminación de la cuenta.</p>

      <h2>5. Marcas y propiedad intelectual de terceros</h2>
      <p>
        Fórmula 1, F1, FIA, los nombres de los equipos, pilotos, circuitos y
        sus marcas asociadas son propiedad de sus respectivos titulares.
        GrandPick los menciona únicamente con fines informativos/de fan,{" "}
        <strong>sin ninguna afiliación oficial</strong>. El contenido propio
        de GrandPick (diseño, marca &ldquo;GrandPick&rdquo;, código) es propiedad de sus
        desarrolladores.
      </p>

      <h2>6. &ldquo;Tal cual&rdquo; / limitación de responsabilidad</h2>
      <p>
        GrandPick se ofrece &ldquo;tal cual&rdquo;, sin garantías de disponibilidad
        ininterrumpida ni de ausencia de errores. No nos hacemos
        responsables por:
      </p>
      <ul>
        <li>
          Errores en el cálculo de puntos/ranking que puedan corregirse una
          vez detectados.
        </li>
        <li>
          Interrupciones del servicio por mantenimiento o causas fuera de
          nuestro control.
        </li>
        <li>Pérdida de datos, en la medida permitida por la ley.</li>
      </ul>

      <h2>7. Cambios o discontinuación del servicio</h2>
      <p>
        Podemos modificar o discontinuar GrandPick (o partes de él) en
        cualquier momento, intentando avisar con razonable anticipación
        cuando sea posible.
      </p>

      <h2>8. Ley aplicable</h2>
      <p>Estos Términos se rigen por las leyes de la República Argentina.</p>

      <h2>9. Contacto</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <div className="legal-page__footer-link">
        <p>
          Ver también la <Link to="/privacidad">Política de Privacidad</Link>.
        </p>
      </div>
    </LegalPageLayout>
  );
}

export default Terms;
