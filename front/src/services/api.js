const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("❌ VITE_API_URL no está definida");
}

export default API_URL;
