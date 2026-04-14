import { uploadToCloudinary, deleteFromCloudinary } from "../api/controllers/upload.api.controllers.js";

export async function resolveImage({
  file,
  currentImage = null,
  folder,
  defaultImage,
}) {
  // Caso CREATE sin imagen
  if (!file && !currentImage) {
    return defaultImage;
  }

  // Caso EDIT sin imagen nueva
  if (!file && currentImage) {
    return currentImage;
  }

  let uniqueId = null;
  if(file) {
      uniqueId = `${Date.now()}-${file.originalname.split('.')[0].replace(/\s+/g, '-')}`;
  }

  const cloudFolder = `grandpick/${folder}`;

  // Caso CREATE con imagen
  if (file && !currentImage) {
    const result = await uploadToCloudinary(file.buffer, uniqueId, cloudFolder);
    return result.public_id;
  }

  // Caso EDIT con imagen nueva → borrar anterior y subir
  if (file && currentImage) {
    if (currentImage !== defaultImage && currentImage !== "general/profile_default.png") {
      try {
        await deleteFromCloudinary(currentImage);
      } catch(e) {
        console.error("No se pudo borrar imagen antigua de Cloudinary:", e);
      }
    }

    const result = await uploadToCloudinary(file.buffer, uniqueId, cloudFolder);
    return result.public_id;
  }
}
