import React, { useState } from 'react';

const UploadImage = ({ onImageSelect, label = "Cargar imagen", isInvalid = false, error}) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const nombreUnico = Math.round(Math.random() * 1e9) + '-' + file.name;
    const renamedFile = new File([file], nombreUnico, { type: file.type });

    setPreview(URL.createObjectURL(file));
    onImageSelect(renamedFile);
  };

  return (
    <div>
      <label>{label}</label>
      <input
        className={`form-control ${isInvalid ? "is-invalid" : ""}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      {error && <div className="invalid-feedback">{error}</div>}
      {preview && (
        <div className="mt-3 text-center">
          <img
            src={preview}
            alt="Vista previa"
            style={{ maxWidth: '200px', borderRadius: '10px' }}
          />
        </div>
      )}
    </div>
  );
};

export default UploadImage;
