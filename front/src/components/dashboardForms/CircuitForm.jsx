import { useState, useEffect } from "react";
import { getCountries, getStatesByCountry, getStateDetails } from "./../../services/countries.services.js";
import UploadsServices from "./../../services/uploads.services.js";
import SearchableSelect from "../SearchableSelect.jsx";
import CountrySelect from "./../../components/CountrySelect.jsx";
import CitySelect from "./../../components/CitySelect.jsx";
import { getImageUrl } from "../../utils/cloudinary.js";
import SubmitButton from "./../SubmitButton.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function CircuitForm({
  initialData = {},
  onSubmit,
  submitLabel = "Guardar",
  isEdit = false,
  errorsForm = {},
}) {
  const [circuit_name, setCircuitName] = useState(initialData.circuit_name || "");
  const [gp_name, setGpName] = useState(initialData.gp_name || "");
  const [length, setLength] = useState(initialData.length || "");
  const [laps, setLaps] = useState(initialData.laps || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [country, setCountry] = useState(initialData.country || "");
  const [city, setCity] = useState(initialData.city || "");
  const [timezone, setTimezone] = useState(initialData.timezone || "");
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(initialData.img || "");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      setCircuitName(initialData.circuit_name || "");
      setGpName(initialData.gp_name || "");
      setLength(initialData.length || "");
      setLaps(initialData.laps || "");
      setDescription(initialData.description || "");
      setCountry(initialData.country || "");
      setCity(initialData.city || "");
      setTimezone(initialData.timezone || "");
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

    const uniqueName = Math.round(Math.random() * 1e9) + '-' + file.name;
    const renamedFile = new File([file], uniqueName, { type: file.type });

    setImageFile(renamedFile);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const circuitData = {
      circuit_name,
      gp_name,
      length,
      laps,
      description,
      country,
      city,
      timezone,
      img: currentImage,
    };

    await onSubmit(circuitData, imageFile, isEdit, currentImage);
  }

  return (
    <form onSubmit={handleSubmit} className="text-start">
      {/* Vista previa de la imagen centrada */}
      {(previewUrl || currentImage) && (
        <div className="text-center mb-4">
          <div 
            className="d-inline-block p-3 rounded-4" 
            style={{ backgroundColor: "#111d2a", maxWidth: "450px", width: "100%" }}
          >
            <img
              src={previewUrl ? previewUrl : getImageUrl(currentImage, 500)}
              alt="Vista previa del circuito"
              className="img-fluid rounded-3"
              style={{ maxHeight: "250px", objectFit: "contain", borderRadius: "10px" }}
            />
          </div>
        </div>
      )}

      {/* Fila 0: Carga de Imagen */}
      <div className="row mb-3">
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

      {/* Fila 1: Nombre y Número de Vueltas */}
      <div className="row mb-3">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.circuit_name ? "is-invalid" : ""}`}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Nombre</span>
              <input
                type="text"
                className="form-control bg-white"
                value={circuit_name}
                onChange={(e) => setCircuitName(e.target.value)}
                placeholder="Nombre del circuito"
              />
            </div>
            {errorsForm.circuit_name && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.circuit_name}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.laps ? "is-invalid" : ""}`}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Numero de vueltas</span>
              <input
                type="number"
                className="form-control bg-white"
                value={laps}
                onChange={(e) => setLaps(e.target.value)}
                placeholder="Número de vueltas"
              />
            </div>
            {errorsForm.laps && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.laps}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 2: País y Ciudad/Estado */}
      <div className="row mb-3">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
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

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.city ? "is-invalid" : ""}`} style={{ overflow: "visible" }}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Ciudad/Estado</span>
              <div className="flex-fill">
                <CitySelect
                  cityFunction={(id, tz) => {
                    setCity(id);
                    setTimezone(tz);
                  }}
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

      {/* Fila 3: Nombre del GP y Longitud */}
      <div className="row mb-3">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.gp_name ? "is-invalid" : ""}`}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Nombre del GP</span>
              <input
                type="text"
                className="form-control bg-white"
                value={gp_name}
                onChange={(e) => setGpName(e.target.value)}
                placeholder="Nombre del Gran Premio"
              />
            </div>
            {errorsForm.gp_name && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.gp_name}</div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.length ? "is-invalid" : ""}`}>
              <span className="gp-input-label" style={{ width: "140px", minWidth: "140px" }}>Longitud (km)</span>
              <input
                type="text"
                className="form-control bg-white"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Longitud en km"
              />
            </div>
            {errorsForm.length && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.length}</div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 4: Descripción */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="gp-input-group-container">
            <div 
              className={`gp-input-group ${errorsForm.description ? "is-invalid" : ""}`}
              style={{ flexDirection: "column", alignItems: "stretch" }}
            >
              <span 
                className="gp-input-label" 
                style={{ 
                  width: "100%", 
                  minWidth: "100%", 
                  borderRadius: "8px 8px 0px 0px", 
                  height: "38px", 
                  justifyContent: "start",
                  paddingLeft: "20px"
                }}
              >
                Descripción
              </span>
              <textarea
                className="form-control text-start bg-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingresa la descripción del circuito..."
                style={{ 
                  border: "none", 
                  borderRadius: "0px 0px 8px 8px", 
                  padding: "15px", 
                  minHeight: "120px",
                  backgroundColor: "white",
                  color: "#222"
                }}
              />
            </div>
            {errorsForm.description && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.description}</div>
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

export default CircuitForm;
