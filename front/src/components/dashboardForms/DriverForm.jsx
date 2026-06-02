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
          className="d-inline-block p-3 rounded-4"
          style={{ backgroundColor: "#111d2a", maxWidth: "220px", width: "100%" }}
        >
          <img
            src={previewUrl ? previewUrl : getImageUrl(currentImage || CLOUDINARY_DEFAULTS.EMPTY, 500)}
            alt="Vista previa del piloto"
            className="img-fluid rounded-3"
            style={{ maxHeight: "200px", objectFit: "contain", borderRadius: "10px" }}
          />
        </div>
      </div>

      {/* Fila 0: Imagen */}
      <div className="row">
        <div className="col-12">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.img ? "is-invalid" : ""}`}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Imagen</span>
              <label
                className="d-flex align-items-center bg-white px-3 flex-fill m-0 form-control"
                style={{ cursor: "pointer", minHeight: "44px" }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="d-none"
                />
                <span className="text-secondary" style={{ fontSize: "0.95rem" }}>
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
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Nombre completo</span>
              <input
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
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Trigrama</span>
              <input
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
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Número</span>
              <input
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
            <div className={`gp-input-group ${errorsForm.country ? "is-invalid" : ""}`} style={{ overflow: "visible" }}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>País</span>
              <div className="flex-fill">
                <CountrySelect
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
            <div className={`gp-input-group ${errorsForm.team ? "is-invalid" : ""}`} style={{ overflow: "visible" }}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Escudería</span>
              <div className="flex-fill">
                <SearchableSelect
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
