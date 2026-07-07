import { useState, useEffect } from "react";
import CountrySelect from "./../../components/CountrySelect.jsx";
import CitySelect from "./../../components/CitySelect.jsx";
import { getImageUrl, CLOUDINARY_DEFAULTS } from "../../utils/cloudinary.js";
import SubmitButton from "./../SubmitButton.jsx";

const API_URL = import.meta.env.VITE_API_URL;

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

  const [previewLogoUrl, setPreviewLogoUrl] = useState("");
  const [previewIsologoUrl, setPreviewIsologoUrl] = useState("");

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
      setCurrentLogo(initialData.logo || "");
      setCurrentIsologo(initialData.isologo || "");
    }
  }, [initialData, isEdit]);

  useEffect(() => {
    if (logoFile) {
      const objectUrl = URL.createObjectURL(logoFile);
      setPreviewLogoUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewLogoUrl("");
    }
  }, [logoFile]);

  useEffect(() => {
    if (isologoFile) {
      const objectUrl = URL.createObjectURL(isologoFile);
      setPreviewIsologoUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewIsologoUrl("");
    }
  }, [isologoFile]);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const uniqueName = Math.round(Math.random() * 1e9) + '-' + file.name;
    const renamedFile = new File([file], uniqueName, { type: file.type });
    setLogoFile(renamedFile);
  };

  const handleIsologoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const uniqueName = Math.round(Math.random() * 1e9) + '-' + file.name;
    const renamedFile = new File([file], uniqueName, { type: file.type });
    setIsologoFile(renamedFile);
  };

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

    await onSubmit(teamData, logoFile, isologoFile);
  }

  return (
    <form onSubmit={handleSubmit} className="text-start">
      {/* Vista previa de Logo e Isologo centrados */}
      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <div 
          className="p-3 rounded-4 text-center d-flex align-items-center justify-content-center gp-image-preview-container"
        >
          <img
            src={previewLogoUrl ? previewLogoUrl : getImageUrl(currentLogo || CLOUDINARY_DEFAULTS.EMPTY, 500)}
            alt="Logo"
            className="img-fluid gp-image-preview"
          />
        </div>
        <div 
          className="p-3 rounded-4 text-center d-flex align-items-center justify-content-center gp-image-preview-container"
        >
          <img
            src={previewIsologoUrl ? previewIsologoUrl : getImageUrl(currentIsologo || CLOUDINARY_DEFAULTS.EMPTY, 500)}
            alt="Isologo"
            className="img-fluid gp-image-preview"
          />
        </div>
      </div>

      {/* Fila 0: Cargas de Logo e Isologo */}
      <div className="row">
        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.logo ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-logo-0">Logo</label>
              <label 
                className="d-flex align-items-center bg-white px-3 flex-fill m-0 form-control gp-file-upload-label"
              >
                <input id="field-logo-0"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="d-none"
                />
                <span className="text-secondary fs-sm">
                  {logoFile ? logoFile.name : (currentLogo ? "Logo cargado" : "Selecciona Logo")}
                </span>
              </label>
            </div>
            {errorsForm.logo && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.logo}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.isologo ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-isologo-1">Isologo</label>
              <label 
                className="d-flex align-items-center bg-white px-3 flex-fill m-0 form-control gp-file-upload-label"
              >
                <input id="field-isologo-1"
                  type="file"
                  accept="image/*"
                  onChange={handleIsologoChange}
                  className="d-none"
                />
                <span className="text-secondary fs-sm">
                  {isologoFile ? isologoFile.name : (currentIsologo ? "Isologo cargado" : "Selecciona Isologo")}
                </span>
              </label>
            </div>
            {errorsForm.isologo && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.isologo}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 1: Nombre Completo y Campeonatos */}
      <div className="row">
        <div className="col-12 col-md-6 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.full_team_name ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-nombrecompleto-2">Nombre completo</label>
              <input id="field-nombrecompleto-2"
                type="text"
                className="form-control bg-white"
                value={full_team_name}
                onChange={(e) => setFullTeamName(e.target.value)}
                placeholder="Nombre completo de la escudería"
              />
            </div>
            {errorsForm.full_team_name && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.full_team_name}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.world_championships ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-campeonatos-3">Campeonatos</label>
              <input id="field-campeonatos-3"
                type="number"
                className="form-control bg-white"
                value={world_championships}
                onChange={(e) => setWorldChampionships(e.target.value)}
                placeholder="Campeonatos mundiales ganados"
              />
            </div>
            {errorsForm.world_championships && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.world_championships}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 2: Nombre Corto y Director */}
      <div className="row">
        <div className="col-12 col-md-6 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.name ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-nombrecorto-4">Nombre corto</label>
              <input id="field-nombrecorto-4"
                type="text"
                className="form-control bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre corto"
              />
            </div>
            {errorsForm.name && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.name}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.chief ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-director-5">Director</label>
              <input id="field-director-5"
                type="text"
                className="form-control bg-white"
                value={chief}
                onChange={(e) => setChief(e.target.value)}
                placeholder="Director / Jefe de equipo"
              />
            </div>
            {errorsForm.chief && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.chief}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: País y Ciudad/Estado */}
      <div className="row">
        <div className="col-12 col-md-6 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group overflow-visible ${errorsForm.country ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-pas-6">País</label>
              <div className="flex-fill">
                <CountrySelect inputId="field-pas-6"
                  countryFunction={setCountry}
                  defaultValue={country}
                  isInvalid={!!errorsForm.country}
                  error={errorsForm.country}
                  hideLabel={true}
                />
              </div>
            </div>
            {errorsForm.country && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.country}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group overflow-visible ${errorsForm.city ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-ciudadestado-7">Ciudad/Estado</label>
              <div className="flex-fill">
                <CitySelect
                  cityFunction={setCity}
                  country={country}
                  defaultValue={city}
                  isInvalid={!!errorsForm.city}
                  error={errorsForm.city}
                  hideLabel={true}
                />
              </div>
            </div>
            {errorsForm.city && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.city}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 4: Unidad de potencia y Color */}
      <div className="row">
        <div className="col-12 col-md-6 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.power_unit ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-unidadpotencia-8">Unidad potencia</label>
              <input id="field-unidadpotencia-8"
                type="text"
                className="form-control bg-white"
                value={power_unit}
                onChange={(e) => setPowerUnit(e.target.value)}
                placeholder="Motor / Unidad de potencia"
              />
            </div>
            {errorsForm.power_unit && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.power_unit}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.color ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-color-9">Color</label>
              <div className="d-flex align-items-center bg-white px-3 flex-fill">
                <input id="field-color-9"
                  type="color"
                  className="form-control form-control-color m-0 p-0 border-0 gp-color-picker"
                  value={color || "#ffffff"}
                  onChange={(e) => setColor(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control border-0 ms-2 bg-white p-0"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#HEXCODE"
                />
              </div>
            </div>
            {errorsForm.color && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.color}</div>
            )}
          </div>
        </div>
      </div>

      {/* Botón de Confirmación Circular */}
      <div className="d-flex justify-content-center mt-4">
        <SubmitButton ariaLabel={submitLabel} />
      </div>
    </form>
  );
}

export default TeamForm;
