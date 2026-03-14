import { authHeaders } from "../utils/helpers.js";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("❌ VITE_API_URL no está definida");
}

/**
 * Helper para manejar las respuestas de fetch y centralizar errores 401
 */
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    // Inyectar headers de auth automáticamente si no se proveen
    const headers = authHeaders(options.headers || {});
    
    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem("auth-token");
        window.dispatchEvent(new Event("auth:logout"));
        // Opcional: recargar para limpiar estados de memoria si el socket no fue suficiente
        // window.location.reload(); 
        throw new Error("Sesión expirada");
    }

    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { message: errorText };
        }
        const error = new Error(errorData.message || 'Error en la petición');
        error.response = { status: response.status, data: errorData };
        throw error;
    }

    return response.json();
}

export default API_URL;
