import { useState, useEffect } from "react";
import CountrySelect from "./../CountrySelect.jsx";
import TeamsServices from "./../../services/teams.services.js";
import SearchableSelect from "./../SearchableSelect.jsx";
import { getImageUrl, CLOUDINARY_DEFAULTS } from "../../utils/cloudinary.js";
import SubmitButton from "./../SubmitButton.jsx";

function DriverForm({
  initialData = {},
  onSubmit,
  submitLabel = "Guardar",
  isEdit = false,
  errorsForm = {},
}) {
  const [full_name, setFullName] = useState(initialData.full_name || "");
  const [trigram, setTrigram] = useState(initialData.trigram || "");
  const [country, setCountry] = useState(initialData.country || "");
  const [number, setNumber] = useState(initialData.number || "");
  const [team, setTeam] = useState(initialData.team || "");
  const [allTeams, setAllTeams] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(initialData.img || "");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    TeamsServices.findAllTeams().then((teams) => setAllTeams(teams));
  }, []);

  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      setFullName(initialData.full_name || "");
      setTrigram(initialData.trigram || "");
      setCountry(initialData.country || "");
      setNumber(initialData.number || "");
      setTeam(initialData.team || "");
      setCurrentImage(initialData.img || "");
    }
  }, [initialData, isEdit]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl("");
    }
  }, [imageFile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const uniqueName = Math.round(Math.random() * 1e9) + "-" + file.name;
    const renamedFile = new File([file], uniqueName, { type: file.type });
    setImageFile(renamedFile);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const driverData = {
      full_name,
      trigram,
      country,
      number,
      team,
      img: currentImage,
    };

    await onSubmit(driverData, imageFile, isEdit, currentImage);
  }

  return (
    <form onSubmit={handleSubmit} className="text-start">
      {/* Vista previa de la imagen */}
      <div className="text-center mb-4">
        <div
          className="d-inline-block p-3 rounded-4 gp-driver-image-container"
        >
          <img
            src={previewUrl ? previewUrl : getImageUrl(currentImage || CLOUDINARY_DEFAULTS.EMPTY, 500)}
            alt="Vista previa del piloto"
            className="img-fluid rounded-3 gp-driver-image"
          />
        </div>
      </div>

      {/* Fila 0: Imagen */}
      <div className="row">
        <div className="col-12">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.img ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-imagen-0">Imagen</label>
              <label
                className="d-flex align-items-center bg-white px-3 flex-fill m-0 form-control gp-file-upload-label"
              >
                <input id="field-imagen-0"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="d-none"
                />
                <span className="text-secondary fs-sm">
                  {imageFile ? imageFile.name : (currentImage ? "Imagen cargada" : "Selecciona una imagen")}
                </span>
              </label>
            </div>
            {errorsForm.img && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.img}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 1: Nombre completo (ancho completo) */}
      <div className="row">
        <div className="col-12">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.full_name ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-nombrecompleto-1">Nombre completo</label>
              <input id="field-nombrecompleto-1"
                type="text"
                className="form-control bg-white"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre completo del piloto"
              />
            </div>
            {errorsForm.full_name && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.full_name}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 2: Trigrama y Número */}
      <div className="row">
        <div className="col-12 col-md-6 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.trigram ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-trigrama-2">Trigrama</label>
              <input id="field-trigrama-2"
                type="text"
                className="form-control bg-white"
                value={trigram}
                onChange={(e) => setTrigram(e.target.value)}
                placeholder="Ej: VER, HAM"
                maxLength={3}
              />
            </div>
            {errorsForm.trigram && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.trigram}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.number ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-nmero-3">Número</label>
              <input id="field-nmero-3"
                type="number"
                className="form-control bg-white"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Número del piloto"
              />
            </div>
            {errorsForm.number && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.number}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: País */}
      <div className="row">
        <div className="col-12 col-md-6 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group overflow-visible ${errorsForm.country ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-pas-4">País</label>
              <div className="flex-fill">
                <CountrySelect inputId="field-pas-4"
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

        {/* Fila 3b: Escudería */}
        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group overflow-visible ${errorsForm.team ? "is-invalid" : ""}`}>
              <label className="gp-input-label gp-input-label-sm" htmlFor="field-escudera-5">Escudería</label>
              <div className="flex-fill">
                <SearchableSelect inputId="field-escudera-5"
                  options={allTeams}
                  value={team}
                  onChange={(opt) => setTeam(opt ? opt.value : "")}
                  placeholder="Seleccioná la escudería"
                  isInvalid={!!errorsForm.team}
                />
              </div>
            </div>
            {errorsForm.team && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.team}</div>
            )}
          </div>
        </div>
      </div>

      {/* Botón de Confirmación */}
      <div className="d-flex justify-content-center mt-4">
        <SubmitButton ariaLabel={submitLabel} />
      </div>
    </form>
  );
}

export default DriverForm;
