import { useState, useEffect } from "react";
import { getCountries, getStatesByCountry, getStateDetails } from "./../../services/countries.services.js";
import UploadsServices from "./../../services/uploads.services.js";
import UploadImage from "./../UploadImage.jsx";
import SearchableSelect from "../SearchableSelect.jsx";
import CountrySelect from "./../../components/CountrySelect.jsx";
import CitySelect from "./../../components/CitySelect.jsx";


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

  /* const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]); */

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


  const handleImageSelect = (file) => setImageFile(file);

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

    console.log(circuitData)

    // Pasamos TAMBIÉN la imagen (o null

    await onSubmit(circuitData, imageFile, isEdit, currentImage);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label>Nombre Circuito</label>
        <input
          type="text"
          className={`form-control ${errorsForm.circuit_name ? "is-invalid" : ""}`}
          value={circuit_name}
          onChange={(e) => setCircuitName(e.target.value)}
        />
        {errorsForm.circuit_name && (
          <div className="invalid-feedback">{errorsForm.circuit_name}</div>
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
    
      {timezone && (
        <div className="mb-3">
          <label>Timezone detectado</label>
          <input type="text" className="form-control" value={timezone} disabled />
        </div>
      )}

      <div className="mb-3">
        <label>Nombre de GP</label>
        <input
          type="text"
          className={`form-control ${errorsForm.gp_name ? "is-invalid" : ""}`}
          value={gp_name}
          onChange={(e) => setGpName(e.target.value)}
        />
        {errorsForm.gp_name && (
          <div className="invalid-feedback">{errorsForm.gp_name}</div>
        )}
      </div>

      <div className="mb-3">
        <label>Longitud (km)</label>
        <input
          type="text"
          className={`form-control ${errorsForm.length ? "is-invalid" : ""}`}
          value={length}
          onChange={(e) => setLength(e.target.value)}
        />
        {errorsForm.length && (
          <div className="invalid-feedback">{errorsForm.length}</div>
        )}
      </div>

      <div className="mb-3">
        <label>Número de vueltas</label>
        <input
          type="number"
          className={`form-control ${errorsForm.laps ? "is-invalid" : ""}`}
          value={laps}
          onChange={(e) => setLaps(e.target.value)}
        />
        {errorsForm.laps && (
          <div className="invalid-feedback">{errorsForm.laps}</div>
        )}
      </div>

      <div className="mb-3">
        <label>Descripción</label>
        <textarea
          className={`form-control ${errorsForm.description ? "is-invalid" : ""}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errorsForm.description && (
          <div className="invalid-feedback">{errorsForm.description}</div>
        )}
      </div>

      <div className="mb-3">
        <UploadImage
          label={isEdit ? "Actualizar Imagen del Circuito" : "Cargar Imagen del Circuito"}
          onImageSelect={handleImageSelect}
          isInvalid={!!errorsForm.img}
          error={errorsForm.img}
        />
        {isEdit && currentImage && (
          <div className="mt-2">
            <p>Imagen actual:</p>
            <img
              src={`http://localhost:2022/api/static/${currentImage}`}
              alt="Circuito"
              style={{ width: "200px", borderRadius: "8px" }}
            />
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default CircuitForm;
