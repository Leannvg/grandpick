import fs from "fs";
import path from "path";

export function errorHandler(err, req, res, next) {
  // 🔥 Cleanup de imagen si existía
  if (req.file && req.uploadFolder) {
    const filePath = path.join(
      process.cwd(),
      "uploads",
      req.uploadFolder,
      req.file.filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // 🧾 Respuesta consistente
  res.status(err.status || 500).json({
    errors: err.formattedErrors || { message: err.message || "Error interno" },
  });
}
