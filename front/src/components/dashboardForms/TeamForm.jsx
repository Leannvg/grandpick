import { useState, useEffect } from "react";
import UploadImage from "./../UploadImage.jsx";
import CountrySelect from "./../../components/CountrySelect.jsx";
import CitySelect from "./../../components/CitySelect.jsx";
import UploadsServices from "./../../services/uploads.services.js";

function TeamForm({
  initialData = {},
  onSubmit,
  submitLabel = "Guardar",
  isEdit = false,
  errorsForm = {},
}) {

  const [name, setName] = useState(initialData.name || "");
  const [full_team_name, setFullTeamName] = useState(initialData.full_team_name || "");
  const [chief, setChief] = useState(initialData.chief || "");
  const [power_unit, setPowerUnit] = useState(initialData.power_unit || "");
  const [world_championships, setWorldChampionships] = useState(initialData.world_championships || 0);
  const [country, setCountry] = useState(initialData.country || "");
  const [city, setCity] = useState(initialData.city || "");
  const [color, setColor] = useState(initialData.color || "");

  const [logoFile, setLogoFile] = useState(null);
  const [isologoFile, setIsologoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(initialData.logo || "");
  const [currentIsologo, setCurrentIsologo] = useState(initialData.isologo || "");

  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      setName(initialData.name || "");
      setFullTeamName(initialData.full_team_name || "");
      setChief(initialData.chief || "");
      setPowerUnit(initialData.power_unit || "");
      setWorldChampionships(initialData.world_championships || 0);
      setCountry(initialData.country || "");
      setCity(initialData.city || "");
      setColor(initialData.color || "");
      setCurrentLogo(initialData.logo || "teams/default_logo.png");
      setCurrentIsologo(initialData.isologo || "teams/default_isologo.png");
    }
  }, [initialData, isEdit]);

  useEffect(() => {
    console.log("logoFile:", logoFile);
  }, [logoFile]);

  useEffect(() => {
    console.log("isologoFile:", isologoFile);
  }, [isologoFile]);

  useEffect(() => {
    console.log("city:", city);
  }, [city]);


  const handleLogoSelect = (file) => setLogoFile(file);
  const handleIsologoSelect = (file) => setIsologoFile(file);

  async function handleSubmit(e) {
    e.preventDefault();

    const teamData = {
      name,
      full_team_name,
      chief,
      power_unit,
      world_championships,
      country,
      city,
      color,
      logo: currentLogo,
      isologo: currentIsologo,
    };

    console.log("Submitting team data:", teamData);

    await onSubmit(teamData, logoFile, isologoFile);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label>Nombre corto</label>
        <input
          type="text"
          className={`form-control ${errorsForm.name ? "is-invalid" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errorsForm.name && <div className="invalid-feedback">{errorsForm.name}</div>}
      </div>

      <div className="mb-3">
        <label>Nombre completo</label>
        <input
          type="text"
          className={`form-control ${errorsForm.full_team_name ? "is-invalid" : ""}`}
          value={full_team_name}
          onChange={(e) => setFullTeamName(e.target.value)}
        />
        {errorsForm.full_team_name && (
          <div className="invalid-feedback">{errorsForm.full_team_name}</div>
        )}
      </div>

      <div className="mb-3">
        <label>Director</label>
        <input
          type="text"
          className={`form-control ${errorsForm.chief ? "is-invalid" : ""}`}
          value={chief}
          onChange={(e) => setChief(e.target.value)}
        />
        {errorsForm.chief && <div className="invalid-feedback">{errorsForm.chief}</div>}
      </div>

      <div className="mb-3">
        <label>Unidad de potencia</label>
        <input
          type="text"
          className={`form-control ${errorsForm.power_unit ? "is-invalid" : ""}`}
          value={power_unit}
          onChange={(e) => setPowerUnit(e.target.value)}
        />
        {errorsForm.power_unit && (
          <div className="invalid-feedback">{errorsForm.power_unit}</div>
        )}
      </div>

      <div className="mb-3">
        <label>Campeonatos mundiales</label>
        <input
          type="number"
          className={`form-control ${errorsForm.world_championships ? "is-invalid" : ""}`}
          value={world_championships}
          onChange={(e) => setWorldChampionships(e.target.value)}
        />
        {errorsForm.world_championships && (
          <div className="invalid-feedback">{errorsForm.world_championships}</div>
        )}
      </div>

      <CountrySelect 
        countryFunction={setCountry} 
        defaultValue={country}
        isInvalid={!!errorsForm.country}
        error={errorsForm.country}
      />

      <CitySelect 
        cityFunction={setCity} 
        country={country} 
        defaultValue={city} 
        isInvalid={!!errorsForm.city}
        error={errorsForm.city}
      />


      <div className="mb-3">
        <label>Color</label>
        <input
          type="color"
          className={`form-control form-control-color ${errorsForm.color ? "is-invalid" : ""}`}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        {errorsForm.color && <div className="invalid-feedback">{errorsForm.color}</div>}
      </div>

      <UploadImage
        label={isEdit ? "Actualizar Isologo" : "Cargar Isologo"}
        onImageSelect={handleIsologoSelect}
        isInvalid={!!errorsForm.isologo}
        error={errorsForm.isologo}
      />
      {isEdit && currentIsologo && (
        <div className="mt-2">
          <p>Isologo actual:</p>
          <img
            src={`http://localhost:2022/api/static/${currentIsologo}`}
            alt="Isologo"
            style={{ width: "120px" }}
          />
        </div>
      )}

      <UploadImage
        label={isEdit ? "Actualizar Logo" : "Cargar Logo"}
        onImageSelect={handleLogoSelect}
        isInvalid={!!errorsForm.logo}
        error={errorsForm.logo}
      />
      {isEdit && currentLogo && (
        <div className="mt-2">
          <p>Logo actual:</p>
          <img
            src={`http://localhost:2022/api/static/${currentLogo}`}
            alt="Logo"
            style={{ width: "120px" }}
          />
        </div>
      )}

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TeamForm;

