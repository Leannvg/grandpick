import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function upload(req, res) {
    const folder = req.params.folder;
    const uploadPath = path.join(process.cwd(), "uploads", folder);

    if (!req.file) {
        return res.status(400).json({ message: "No se cargó ningún archivo." });
    }

    // mover el archivo a la carpeta correspondiente
    const newPath = path.join(uploadPath, req.file.filename);

    fs.renameSync(req.file.path, newPath);

    return res.status(200).json({
        message: "Imagen cargada correctamente",
        file: `${folder}/${req.file.filename}`,
    });
}


function replaceUpload(req, res) {
    const { folder, filename } = req.params;
    const filePath = path.join(process.cwd(), "uploads", folder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Archivo no encontrado" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "No se envió una nueva imagen." });
    }

    try {
        fs.unlinkSync(filePath);

        const newPath = path.join(process.cwd(), "uploads", folder, req.file.filename);
        fs.renameSync(req.file.path, newPath);

        return res.status(200).json({
            message: "Imagen reemplazada correctamente",
            file: `${folder}/${req.file.filename}`,
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al reemplazar", error });
    }
}


function deleteUpload(req, res) {
    const { folder, filename } = req.params;
    const filePath = path.join(process.cwd(), "uploads", folder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Archivo no encontrado" });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({ message: "Archivo eliminado correctamente" });
}


function getUpload(req, res) {
    const { folder, filename } = req.params;

    const filePath = path.join(process.cwd(), "uploads", folder, filename);

    return res.sendFile(filePath, (err) => {
        if (err) {
            return res.status(404).send("Imagen no encontrada");
        }
    });
}


function getGeneralImages(req, res){
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', '..', 'uploads/general', filename);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error al enviar el archivo:', err);
            res.status(404).send('Imagen no encontrada');
        }
    });
};

export { upload, replaceUpload, getUpload, deleteUpload, getGeneralImages};