import { useState } from "react";
import SubmitButton from "../../components/SubmitButton.jsx";
import FloatingDialog from "../../components/FloatingDialog.jsx";
import LoaderCar from "../../components/LoaderCar.jsx";
import LoaderSpinner from "../../components/LoaderSpinner.jsx";
import Podium from "../../components/Podium.jsx";
import PasswordInput from "../../components/PasswordInput.jsx";
import CalendarCard from "../../components/calendar/CalendarCard.jsx";

// Datos de muestra — ninguno llama a la API real, todo local.
const MOCK_PODIUM = [
  { id: "1", rank: 1, firstName: "Ezequiel", lastName: "Arias", country: "AR", points: 655 },
  { id: "2", rank: 2, firstName: "Matías", lastName: "Arias", country: "AR", points: 640 },
  { id: "3", rank: 3, firstName: "Julieta", lastName: "Arias", country: "AR", points: 612 },
];

// Fin de semana sprint completo, con fechas fijas en el pasado para que la
// demo (marca de "finalizada") se vea siempre igual sin depender de hoy.
// `sessions` solo lleva tipos de Races (qualifying/sprint/race) — las
// prácticas van aparte en `practices` (vienen de Practice_Sessions), igual
// que en los datos reales; ver rules/features/practicas.md.
const MOCK_RACE = {
  _id: "lab-race",
  circuit: {
    _id: "lab-circuit",
    country: "SG",
    country_name: "Singapore",
    circuit_name: "Circuito callejero de Marina Bay",
    timezone: "Asia/Singapore",
  },
  sessionTypes: ["sprint", "qualifying", "race"],
  sessions: [
    { _id: "s2", date_race: "2026-01-09T09:30:00.000Z", points_system: { type: "qualifying" } },
    { _id: "s3", date_race: "2026-01-10T06:00:00.000Z", points_system: { type: "sprint" } },
    { _id: "s4", date_race: "2026-01-10T10:00:00.000Z", points_system: { type: "qualifying" } },
    { _id: "s5", date_race: "2026-01-11T09:00:00.000Z", points_system: { type: "race" } },
  ],
};

const MOCK_PRACTICES = [
  { _id: "p1", name: "FP1", date_utc: "2026-01-09T05:30:00.000Z" },
];

function ComponentsSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pw, setPw] = useState("");

  return (
    <div>
      <h1 className="lab-section-title">Componentes</h1>
      <p className="lab-section-desc">
        Importados tal cual del código real (no son copias ni capturas): si
        cambiás el componente, esta vista cambia sola. Catálogo de
        componentes completo con props en <code>rules/componentes.md</code>.
      </p>

      <div className="lab-block">
        <h2 className="lab-block-title">Botones</h2>
        <div className="lab-specimen-grid">
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--dark">
              <SubmitButton />
            </div>
            <div className="lab-specimen-label">SubmitButton (confirmar/enviar)</div>
          </div>
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--light">
              <button className="btn-row-action"><i className="bi bi-arrow-left-right"></i></button>
            </div>
            <div className="lab-specimen-label">.btn-row-action (acción dentro de tabla)</div>
          </div>
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--dark">
              <button className="gp-btn-cancel" style={{ marginRight: 10 }}>Cancelar</button>
              <button className="gp-btn-confirm">Confirmar</button>
            </div>
            <div className="lab-specimen-label">.gp-btn-cancel / .gp-btn-confirm (modales)</div>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Badges / chips</h2>
        <div className="lab-specimen-grid">
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--panel">
              <span className="cal-session__dur is-race">2 HS.</span>
            </div>
            <div className="lab-specimen-label">Chip sesión Race</div>
          </div>
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--panel">
              <span className="cal-session__dur is-sprint">35 MIN.</span>
            </div>
            <div className="lab-specimen-label">Chip sesión Sprint</div>
          </div>
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--light">
              <span className="cal-card__sprint">SPRINT</span>
            </div>
            <div className="lab-specimen-label">Badge «fin de semana sprint»</div>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Formularios</h2>
        <div className="lab-specimen-grid">
          <div className="lab-specimen lab-specimen-wide">
            <div className="lab-specimen-stage lab-specimen-stage--dark">
              <div style={{ width: 320 }}>
                <PasswordInput
                  label="Contraseña"
                  id="lab-pw"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="lab-specimen-label">PasswordInput (con mostrar/ocultar)</div>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Loaders</h2>
        <div className="lab-specimen-grid">
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--dark" style={{ minHeight: 140 }}>
              <LoaderCar fullScreen={false} message="Cargando..." />
            </div>
            <div className="lab-specimen-label">LoaderCar (cargas de página)</div>
          </div>
          <div className="lab-specimen">
            <div className="lab-specimen-stage lab-specimen-stage--dark">
              <LoaderSpinner />
            </div>
            <div className="lab-specimen-label">LoaderSpinner</div>
          </div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Modal de confirmación</h2>
        <div className="lab-specimen lab-specimen-wide">
          <div className="lab-specimen-stage lab-specimen-stage--dark">
            <button className="gp-btn-confirm" onClick={() => setDialogOpen(true)}>
              Abrir FloatingDialog
            </button>
          </div>
          <div className="lab-specimen-label">FloatingDialog (patrón .gp-modal-*)</div>
        </div>
        <FloatingDialog
          show={dialogOpen}
          title="¿Confirmás la acción?"
          message="Este es el modal real de la app, con datos de muestra."
          confirmText="Confirmar"
          cancelText="Cancelar"
          onConfirm={() => setDialogOpen(false)}
          onCancel={() => setDialogOpen(false)}
        />
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Podio</h2>
        <div className="lab-specimen lab-specimen-wide">
          <div className="lab-specimen-stage lab-specimen-stage--dark">
            <Podium entries={MOCK_PODIUM} />
          </div>
          <div className="lab-specimen-label">Podium (Home, Ranking, Campeonato)</div>
        </div>
      </div>

      <div className="lab-block">
        <h2 className="lab-block-title">Card de calendario</h2>
        <p className="lab-prose" style={{ marginBottom: 14 }}>
          Con datos de muestra de un fin de semana sprint completo, fechas
          fijas en el pasado (para ver la marca de «finalizada» siempre
          igual). Clickeá la fila para abrir el panel de horarios.
        </p>
        <div className="lab-specimen lab-specimen-wide">
          <div className="lab-specimen-stage lab-specimen-stage--dark" style={{ padding: 0 }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
              <CalendarCard
                race={MOCK_RACE}
                roundNumber={17}
                status="finished"
                dayLabel="09–11"
                monthLabel="ENE"
                practices={MOCK_PRACTICES}
                predictionsByRaceId={{ s3: true, s4: true, s5: true }}
              />
            </div>
          </div>
          <div className="lab-specimen-label">CalendarCard</div>
        </div>
      </div>
    </div>
  );
}

export default ComponentsSection;
