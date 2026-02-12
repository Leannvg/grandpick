import fs from "fs";
import path from "path";

export function resolveImage({
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

  // Caso CREATE con imagen
  if (file && !currentImage) {
    return `${folder}/${file.filename}`;
  }

  // Caso EDIT con imagen nueva → borrar anterior
  if (file && currentImage) {
    const oldFilename = currentImage.split("/").pop();
    const oldPath = path.join(process.cwd(), "uploads", folder, oldFilename);

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }

    return `${folder}/${file.filename}`;
  }
}
