import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

// 🔹 SUBIR IMAGEN
async function cargarImagen(formData, folder) {
    // Ya no hace falta append a formData si pasamos por param, pero Cloudinary lo toma de multer en el back
    const res = await fetch(`${API_URL}/api/upload/${folder}`, {
        method: "POST",
        headers: authHeaders(),
        body: formData
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    const data = await res.json();
    return data.file;
}


// 🔹 REEMPLAZAR IMAGEN
async function reemplazarImagen(filePath, formData) {
    const res = await fetch(`${API_URL}/api/upload/manage?filePath=${encodeURIComponent(filePath)}`, {
        method: "PUT",
        headers: authHeaders(),
        body: formData
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    const data = await res.json();
    return data.file;  // <-- devolver public_id final
}


// 🔹 ELIMINAR IMAGEN
async function eliminarImagen(filePath) {
    const res = await fetch(`${API_URL}/api/upload/manage?filePath=${encodeURIComponent(filePath)}`, {
        method: "DELETE",
        headers: authHeaders()
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    const data = await res.json();
    return data.message;
}


export default {
    cargarImagen,
    reemplazarImagen,
    eliminarImagen
};
