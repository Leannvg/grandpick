import { authHeaders } from "../utils/helpers.js";
import API_URL from "./api.js";

// 🔹 IMÁGENES ESTÁTICAS
function obtenerImagenEstatica(ruta) {
    return `${API_URL}/api/static/${ruta}`;
}

// 🔹 TRAER IMAGEN DINÁMICA (users, drivers, etc.)
async function traerImagen(nombreImagen) {
    return `${API_URL}/api/upload/${nombreImagen}`;
}


// 🔹 SUBIR IMAGEN
async function cargarImagen(formData, folder) {
    formData.append("folder", folder);

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


// 🔹 REEMPLAZAR IMAGEN (corregido)
async function reemplazarImagen(folder, filename, formData) {
    
    const res = await fetch(`${API_URL}/api/upload/${folder}/${filename}`, {
        method: "PUT",
        headers: authHeaders(),
        body: formData
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    const data = await res.json();
    return data.file;  // <-- devolver ruta final correcta
}



// 🔹 ELIMINAR IMAGEN
async function eliminarImagen(filePath) {
    const res = await fetch(`${API_URL}/api/upload/${filePath}`, {
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
    obtenerImagenEstatica,
    traerImagen,
    cargarImagen,
    reemplazarImagen,
    eliminarImagen
};
