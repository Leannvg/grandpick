import { useState, useEffect } from "react";
import { getStatesByCountry } from "../services/countries.services.js";
import SearchableSelect from "../components/SearchableSelect.jsx";

function CitySelect({ cityFunction, country, defaultValue = "", isInvalid = false, error }) {
  const [states, setStates] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");

  // Cargar estados cuando cambia el país
  useEffect(() => {
    if (!country) {
      setStates([]);
      setSelectedCity("");
      return;
    }

    getStatesByCountry(country).then((data) => {
      setStates(data);

      // setear default SOLO cuando se cargan los estados
      if (defaultValue) {
        const match = data.find(s => s.name === defaultValue || s.iso2 === defaultValue);
        if (match) {
          setSelectedCity(match.iso2);
          cityFunction(match.iso2);
        }
      }
    });
  }, [country]);

  const handleChange = (selected) => {
    const value = selected?.value || "";
    setSelectedCity(value);
    cityFunction(value);
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
