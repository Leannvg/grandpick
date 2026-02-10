import { useState, useEffect } from "react";
import UploadImage from "./../UploadImage.jsx";
import CountrySelect from "./../CountrySelect.jsx";
import TeamsServices from "./../../services/teams.services.js";
const API_URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    TeamsServices.findAllTeams().then((teams) => setAllTeams(teams));
  }, []);

  const handleImageSelect = (file) => setImageFile(file);

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

    // Pasamos TAMBIÉN la imagen (o null)
    await onSubmit(driverData, imageFile, isEdit, currentImage);
  }



  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="full_name">Nombre completo</label>
        <input
          type="text"
          className={`form-control ${errorsForm.full_name ? "is-invalid" : ""}`}
          id="full_name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errorsForm.full_name && (
          <div className="invalid-feedback">{errorsForm.full_name}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="trigram">Trigrama</label>
        <input
          type="text"
          className={`form-control ${errorsForm.trigram ? "is-invalid" : ""}`}
          id="trigram"
          value={trigram}
          onChange={(e) => setTrigram(e.target.value)}
        />
        {errorsForm.trigram && (
          <div className="invalid-feedback">{errorsForm.trigram}</div>
        )}
      </div>

      <div className="mb-3">
        <CountrySelect
          countryFunction={setCountry}
          isInvalid={!!errorsForm.country}
          error={errorsForm.country}
          defaultValue={country}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="number">Número</label>
        <input
          type="number"
          className={`form-control ${errorsForm.number ? "is-invalid" : ""}`}
          id="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        {errorsForm.number && (
          <div className="invalid-feedback">{errorsForm.number}</div>
        )}
      </div>

      <div className="mb-3">
        <UploadImage
          label={isEdit ? "Actualizar Imagen del Piloto" : "Cargar Imagen del Piloto"}
          onImageSelect={handleImageSelect}
          isInvalid={!!errorsForm.img}
          error={errorsForm.img}
        />
        {isEdit && currentImage && (
          <div className="mt-3">
            <p>Imagen actual:</p>
            <img
              src={`${API_URL}/api/static/${currentImage}`}
              alt="Piloto"
              style={{ width: "120px", borderRadius: "8px" }}
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

export default DriverForm;
