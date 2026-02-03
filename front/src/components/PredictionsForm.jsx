import { useEffect, useState } from "react";
import DriversServices from "../services/drivers.services.js";
import SearchableSelect from "./SearchableSelect.jsx";

function PredictionsForm({ points = {}, race_types = [], onDriverChange }) {
  const [drivers, setDrivers] = useState([]);
  const [selections, setSelections] = useState([]);
  const [invalidIndexes, setInvalidIndexes] = useState([]);


  const raceType = race_types.find(
    (rt) => rt.points_system._id === points._id
  );

  useEffect(() => {
    DriversServices.findAll().then(setDrivers);
  }, []);

  useEffect(() => {
    if (!raceType) return;
    const total = points.points.length;
    const base = Array(total).fill("");

    if (raceType.results?.length > 0) {
      const restored = [...base];

      raceType.results.forEach(r => {
        const idx = r.position - 1;
        if (idx >= 0 && idx < total) {
          restored[idx] = r.driver;
        }
      });

      setSelections(restored);
      setInvalidIndexes([]);

      restored.forEach((driverId, index) => {
        onDriverChange(points._id, index, driverId);
      });
    }
    else {

      setSelections(base);
      setInvalidIndexes([]);

      base.forEach((driverId, index) => {
        onDriverChange(points._id, index, driverId);
      });
    }
  }, [raceType, points, onDriverChange]);

  const handleChange = (index, value) => {
    const updated = [...selections];
    const newInvalids = [...invalidIndexes];

    if (value !== ""){

      const existingIndex = updated.findIndex((d, i) => d === value && i !== index);
      if (existingIndex !== -1) {
        updated[existingIndex] = ""; 
        if (!newInvalids.includes(existingIndex)) {
          newInvalids.push(existingIndex);
        }
      }
    }


    updated[index] = value;
    const cleanedInvalids = newInvalids.filter((i) => i !== index);

    setSelections(updated);
    setInvalidIndexes(cleanedInvalids);


    updated.forEach((driverId, idx) => {
      onDriverChange(points._id, idx, driverId);
    });
  };

  return (
    <div>
      {points.points.map((_, index) => (
        <div className="mb-3" key={index}>
          <label>{index + 1}</label>

          <div className={`react-select-container ${invalidIndexes.includes(index) ? "is-invalid" : ""}`}>
          <SearchableSelect
            value={selections[index] || ""}
            onChange={(selected) => handleChange(index, selected?.value || "")}
            options={drivers.map((d) => ({
              _id: d._id,
              name: d.full_name,
            }))}
            placeholder="Seleccione un piloto"
          />
        </div>

        {invalidIndexes.includes(index) && (
          <div className="invalid-feedback d-block">
            Este piloto fue reasignado a otra posición.
          </div>
        )}
        </div>
      ))}
    </div>
  );
}

export default PredictionsForm;