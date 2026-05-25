import RacesServices from "../../../services/races.services.js";
import RaceForm from "../../../components/dashboardForms/RaceForm.jsx";
import { useNavigate } from "react-router-dom";


function RaceCreate({action}) {
  const handleSave = async (races) => {
    await Promise.all(races.map((r) => RacesServices.create(r)));
  };

  return (
    <main>
      <section className="auth-section page-section container text-center">
        <div className="auth-container" style={{ maxWidth: "550px" }}>
          <header className="page-header">
            <p className="section-label">Administración</p>
            <h1 className="section-title">NUEVA CARRERA</h1>
            <p className="section-subtitle">
              Recordá ingresar las fechas y horarios según la hora local del circuito. Estos serán utilizados como datos oficiales para todas las conversiones y horarios globales.
            </p>
          </header>

          <RaceForm onSave={handleSave} submitText="Cargar carrera" action={action}/>
        </div>
      </section>
    </main>
  );
}

export default RaceCreate;