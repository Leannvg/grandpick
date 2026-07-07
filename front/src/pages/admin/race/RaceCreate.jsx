import RacesServices from "../../../services/races.services.js";
import RaceForm from "../../../components/dashboardForms/RaceForm.jsx";
import BackButton from "../../../components/BackButton.jsx";
import { useNavigate } from "react-router-dom";


function RaceCreate({ action }) {
  const handleSave = async (races) => {
    await Promise.all(races.map((r) => RacesServices.create(r)));
  };

  return (
    <>
      <section className="auth-section page-section container text-center">
        <div className="auth-container auth-container-admin">
          <BackButton to="/admin/dashboard?tab=Carreras" text="Volver a carreras" />
          <header className="page-header">
            <p className="section-label">Carga una nueva carrera</p>
            <h1 className="section-title">NUEVA CARRERA</h1>
            <p className="section-subtitle">
              Desde acá podés cargar la información de una nueva carrera en el calendario
            </p>
          </header>

          <div className="alert alert-danger shadow rounded-3 my-4 p-3 text-center gp-alert-danger">
            Recordá ingresar las fechas y horarios según la hora local del circuito. Estos serán utilizados como datos oficiales para todas las conversiones y horarios globales.
          </div>

          <RaceForm onSave={handleSave} submitText="Cargar carrera" action={action} />
        </div>
      </section>
    </>
  );
}

export default RaceCreate;