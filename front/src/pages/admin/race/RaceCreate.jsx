import RacesServices from "../../../services/races.services.js";
import RaceForm from "../../../components/dashboardForms/RaceForm.jsx";
import { useNavigate } from "react-router-dom";


function RaceCreate({action}) {
  const handleSave = async (races) => {
    await Promise.all(races.map((r) => RacesServices.create(r)));
  };

  return (
    <div className="container admin">
      <h1>Nueva Carrera</h1>
      <div className="alert alert-danger d-flex align-items-center justify-content-center shadow rounded-3 my-4">
        Recordá ingresar las fechas y horarios según la hora local del circuito. Estos serán utilizados como datos oficiales para todas las conversiones y horarios globales.
      </div>
      <RaceForm onSave={handleSave} submitText="Cargar carrera" action={action}/>
    </div>
  );
}

export default RaceCreate;