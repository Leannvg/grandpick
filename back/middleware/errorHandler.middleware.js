import fs from "fs";
import path from "path";

export function errorHandler(err, req, res, next) {
  // 🔥 Cleanup de imagen si existía localmente (solo para Multer DiskStorage)
  if (req.file && req.file.path) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }

  // 🧾 Respuesta consistente
  res.status(err.status || 500).json({
    errors: err.formattedErrors || { message: `${err.message || "Error interno"}\nStack: ${err.stack || "N/A"}` },
  });
}
