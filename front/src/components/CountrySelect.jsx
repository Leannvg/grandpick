import { useState, useEffect } from "react";
import { getCountries } from "../services/countries.services.js";
import SearchableSelect from "../components/SearchableSelect.jsx";

function CountrySelect({
  countryFunction,
  defaultValue = "",
  isInvalid = false,
  error,
  hideLabel = false,
}) {
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
    <div className={hideLabel ? "" : "mb-3"}>
      {!hideLabel && <label>País</label>}

      <SearchableSelect
        options={countries.map((c) => ({
          _id: c.iso2,
          name: c.name,
          original: c,
        }))}
        value={selectedCountry}
        onChange={handleChange}
        placeholder="Selecciona un país"
        isInvalid={isInvalid}
      />

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export default CountrySelect;
