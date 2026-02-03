import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RacesServices from "../../../services/races.services.js";
import RaceForm from "../../../components/dashboardForms/RaceForm.jsx";
import * as helpers from "../../../utils/helpers.js"; 
import { DateTime } from "luxon";

function RaceEdit({action}) {
  const { id, year } = useParams();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!id || !year) return;
    RacesServices.findByCircuitAndYear(id, year).then((data) => {
      console.log("data:", data);
      const mapped = helpers.mapRaceToInitialData(data);
      console.log("mapped data:", mapped);
      setInitialData(mapped);
    });
  }, [id, year]);

  const handleSave = async (races) => {
    await Promise.all(races.map((r) => RacesServices.update(r.id_race, r)));
  };
  if (!initialData) return <p>Cargando...</p>;

  return (
    <div className="container admin">
      <h1>Editar Carrera</h1>
      <div className="alert alert-danger d-flex align-items-center justify-content-center shadow rounded-3 my-4">
        Recordá ingresar las fechas y horarios según la hora local del circuito. Estos serán utilizados como datos oficiales para todas las conversiones y horarios globales.
      </div>
      <RaceForm
        initialData={initialData}
        onSave={handleSave}
        submitText="Actualizar carrera"
        action={action}
        race_types={initialData.race_types || []}
      />
    </div>
  );
}

export default RaceEdit;
