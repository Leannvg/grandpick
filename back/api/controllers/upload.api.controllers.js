import { v2 as cloudinary } from 'cloudinary';

// La configuración tomará automáticamente las credenciales de CLOUDINARY_URL.
// Solo inyectamos manualmente si las variables individuales existen.
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim()
  });
}

const uploadToCloudinary = (buffer, publicId, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                public_id: publicId,
                format: 'webp' // We can force a format or just let Cloudinary handle it via f_auto later
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

function upload(req, res) {
    const folder = req.params.folder;

    if (!req.file) {
        return res.status(400).json({ message: "No se cargó ningún archivo." });
    }

    // Como publicId usamos timestamp + un identificador base
    // Ya que si no usamos el base id que pidió el usuario
    const uniqueId = `${Date.now()}-${req.file.originalname.split('.')[0].replace(/\s+/g, '-')}`;
    const cloudFolder = `grandpick/${folder}`;

    uploadToCloudinary(req.file.buffer, uniqueId, cloudFolder)
        .then(result => {
            return res.status(200).json({
                message: "Imagen cargada correctamente en Cloudinary",
                // Retornamos el public_id que será la ruta que guardaremos en la DB (ej. grandpick/drivers/171239857-avatar)
                file: result.public_id,
            });
        })
        .catch(err => {
            console.error("Cloudinary Upload Error:", err);
            return res.status(500).json({ message: "Error al subir a Cloudinary", error: err });
        });
}

function replaceUpload(req, res) {
    const { filePath } = req.query; // ej: grandpick/drivers/123456-foto

    if (!filePath) {
        return res.status(400).json({ message: "Se requiere un filePath para reemplazar." });
    }

    if (!req.file) {
        return res.status(400).json({ message: "No se envió una nueva imagen." });
    }

    // 1. Eliminar la versión vieja en Cloudinary
    cloudinary.uploader.destroy(filePath)
        .then(() => {
            // 2. Subir la nueva generándole un uniqueId nuevo para romper posible caché
            const uniqueId = `${Date.now()}-${req.file.originalname.split('.')[0].replace(/\s+/g, '-')}`;
            // asumiendo que el folder anterior está en el archivo viejo ("grandpick/drivers/hash")
            // podemos tomar la carpeta extrayendo todo antes del filepath
            const segments = filePath.split('/');
            segments.pop(); // tira el id viejo
            const cloudFolder = segments.join('/'); // queda grandpick/drivers 

            return uploadToCloudinary(req.file.buffer, uniqueId, cloudFolder);
        })
        .then(result => {
            return res.status(200).json({
                message: "Imagen reemplazada correctamente",
                file: result.public_id,
            });
        })
        .catch(error => {
            console.error("Cloudinary Replace Error:", error);
            return res.status(500).json({ message: "Error al reemplazar", error });
        });
}

function deleteUpload(req, res) {
    const { filePath } = req.query;

    if (!filePath) {
        return res.status(400).json({ message: "No se proporcionó filePath" });
    }

    cloudinary.uploader.destroy(filePath)
        .then(result => {
            return res.status(200).json({ message: "Archivo eliminado correctamente de Cloudinary" });
        })
        .catch(error => {
            console.error("Cloudinary Delete Error:", error);
            return res.status(500).json({ message: "Error al borrar", error });
        });
}

// Estos dos métodos ya no deberían usarse ya que todo se sirve directo de Cloudinary. 
// Quedan acá devolviendo 404 por seguridad u observabilidad.
function getUpload(req, res) {
    return res.status(404).send("Imágenes migradas a Cloudinary");
}

function getGeneralImages(req, res) {
    res.status(404).send('Imágenes migradas a Cloudinary');
};

const deleteFromCloudinary = async (filePath) => {
    return cloudinary.uploader.destroy(filePath);
}

export { upload, replaceUpload, getUpload, deleteUpload, getGeneralImages, uploadToCloudinary, deleteFromCloudinary };