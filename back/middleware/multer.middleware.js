import multer from "multer";
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Archivo no permitido. Solo se aceptan imágenes (jpeg, jpg, png, gif, webp).");
    error.status = 400;
    cb(error);
  }
};

export const multerControl = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
