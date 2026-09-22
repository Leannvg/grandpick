import { useEffect, useState } from "react";
import DriversServices from "../services/drivers.services.js";
import TeamsServices from "../services/teams.services.js";
import SearchableSelect from "./SearchableSelect.jsx";

function PredictionsForm({ points = {}, race_types = [], onResultChange }) {
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selections, setSelections] = useState([]);
  const [teamSelections, setTeamSelections] = useState([]);
  const [invalidIndexes, setInvalidIndexes] = useState([]);


  const raceType = race_types.find(
    (rt) => rt.points_system._id === points._id
  );

  useEffect(() => {
    DriversServices.findAll().then(setDrivers);
    TeamsServices.findAll().then(setTeams);
  }, []);

  useEffect(() => {
    if (!raceType) return;
    const total = points.points.length;
    const base = Array(total).fill("");
    const baseTeams = Array(total).fill("");

    if (raceType.results?.length > 0) {
      const restored = [...base];
      const restoredTeams = [...baseTeams];

      raceType.results.forEach(r => {
        const idx = r.position - 1;
        if (idx >= 0 && idx < total) {
          restored[idx] = r.driver?._id || r.driver;
          restoredTeams[idx] = r.team?._id || r.team || "";
        }
      });

      setSelections(restored);
      setTeamSelections(restoredTeams);
      setInvalidIndexes([]);

      restored.forEach((driverId, index) => {
        onResultChange(points._id, index, driverId, restoredTeams[index]);
      });
    }
    else {

      setSelections(base);
      setTeamSelections(baseTeams);
      setInvalidIndexes([]);

      base.forEach((driverId, index) => {
        onResultChange(points._id, index, driverId, "");
      });
    }
  }, [raceType, points, onResultChange]);

  const handleChange = (index, value) => {
    const updated = [...selections];
    const updatedTeams = [...teamSelections];
    const newInvalids = [...invalidIndexes];

    if (value !== "") {

      const existingIndex = updated.findIndex((d, i) => d === value && i !== index);
      if (existingIndex !== -1) {
        updated[existingIndex] = "";
        if (!newInvalids.includes(existingIndex)) {
          newInvalids.push(existingIndex);
        }
      }
    }


    updated[index] = value;
    // Sugiere el equipo actual del piloto elegido; queda editable con el
    // select de al lado (reemplazos, cambios de escudería, carga histórica).
    const selectedDriver = drivers.find((d) => d._id === value);
    updatedTeams[index] = selectedDriver?.team_info?._id || selectedDriver?.team || "";

    const cleanedInvalids = newInvalids.filter((i) => i !== index);

    setSelections(updated);
    setTeamSelections(updatedTeams);
    setInvalidIndexes(cleanedInvalids);


    updated.forEach((driverId, idx) => {
      onResultChange(points._id, idx, driverId, updatedTeams[idx]);
    });
  };

  const handleTeamChange = (index, value) => {
    const updatedTeams = [...teamSelections];
    updatedTeams[index] = value;
    setTeamSelections(updatedTeams);
    onResultChange(points._id, index, selections[index] || "", value);
  };

  return (
    <div>
      {points.points.map((_, index) => (
        <div className="gp-input-group-container" key={index}>
          <div className={`gp-input-group ${invalidIndexes.includes(index) ? "is-invalid" : ""}`} style={{ overflow: "visible" }}>
            <span className="gp-input-label" style={{ minWidth: "60px", width: "60px" }}>
              {index + 1}
            </span>
            <div className="flex-fill">
              <SearchableSelect
                isDriver={true}
                value={selections[index] || ""}
                onChange={(selected) => handleChange(index, selected?.value || "")}
                options={drivers
                  .filter((d) => d.active === true || d._id === selections[index])
                  .map((d) => ({
                    _id: d._id,
                    name: d.full_name,
                    teamName: d.team_info?.name || "",
                    color: d.team_info?.color || "#ccc",
                  }))}
                placeholder="Seleccione un piloto"
              />
            </div>
            <div className="flex-fill gp-result-team-select">
              <SearchableSelect
                value={teamSelections[index] || ""}
                onChange={(selected) => handleTeamChange(index, selected?.value || "")}
                options={teams.map((t) => ({ _id: t._id, name: t.name, color: t.color }))}
                placeholder="Escudería"
                isDisabled={!selections[index]}
              />
            </div>
          </div>

          {invalidIndexes.includes(index) && (
            <div className="invalid-feedback d-block text-start mt-1">
              Este piloto fue reasignado a otra posición.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PredictionsForm;