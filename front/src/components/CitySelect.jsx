import { useState, useEffect } from "react";
import { getStatesByCountry, getStateDetails } from "../services/countries.services.js";
import SearchableSelect from "../components/SearchableSelect.jsx";

function CitySelect({ cityFunction, country, defaultValue = "", isInvalid = false, error }) {
  const [states, setStates] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  // Cargar estados cuando cambia el país o el valor por defecto
  useEffect(() => {
    if (!country) {
      setStates([]);
      setSelectedCity("");
      return;
    }

    getStatesByCountry(country).then(async (data) => {
      setStates(data);

      if (defaultValue) {
        const match = data.find(s => s.name === defaultValue || s.iso2 === defaultValue);
        if (match) {
          setSelectedCity(match.iso2);

          let tz = match.timezone;
          if (!tz) {
            try {
              const details = await getStateDetails(country, match.iso2);
              tz = details?.timezone || "";
            } catch (e) {
              console.error("Error fetching state details during init:", e);
            }
          }

          if (tz) {
            cityFunction(match.iso2, tz);
          }
        }
      }
    });
  }, [country, defaultValue]);

  const handleChange = async (selected) => {
    const value = selected?.value || "";
    let tz = selected?.timezone || "";

    // Si no tiene timezone en el listado, intentamos buscar el detalle del estado
    if (value && !tz) {
      try {
        const details = await getStateDetails(country, value)
        tz = details?.timezone || ""
      } catch (e) {
        console.error("Error fetching state details:", e)
      }
    }

    setSelectedCity(value);
    cityFunction(value, tz);
  };

  return (
    <div className="mb-3">
      <label>Ciudad / Estado</label>

      <SearchableSelect
        options={states.map(s => ({
          _id: s.iso2,
          name: s.name,
          timezone: s.timezone,
        }))}
        value={selectedCity}
        onChange={handleChange}
        placeholder={!country ? "Seleccione un país primero" : "Seleccione una opción"}
        isDisabled={!country}
        isInvalid={isInvalid}

      />

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}


export default CitySelect;
