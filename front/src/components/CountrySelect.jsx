import { useState, useEffect } from "react";
import { getCountries } from "../services/countries.services.js";
import SearchableSelect from "../components/SearchableSelect.jsx";

function CountrySelect({ countryFunction, defaultValue = "", isInvalid = false, error }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(defaultValue);

  useEffect(() => {
    getCountries().then((data) => setCountries(data));
  }, []);

  useEffect(() => {
    setSelectedCountry(defaultValue);
  }, [defaultValue]);

  const handleChange = (selected) => {
    const value = selected?.value || "";
    setSelectedCountry(value);
    countryFunction(value);
  };

    return (
    <div className="mb-3">
      <label>País</label>

      <SearchableSelect
        options={countries.map((c) => ({
          _id: c.iso2,                 // CLAVE: coincide con selectedCountry
          name: `${c.emoji} ${c.name}`, // Mostrar bandera + nombre
          original: c
        }))}
        value={selectedCountry}
        onChange={handleChange}
        placeholder="Selecciona un país"
        isInvalid={isInvalid}
        className="emoji-flag"
      />

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}


export default CountrySelect;
