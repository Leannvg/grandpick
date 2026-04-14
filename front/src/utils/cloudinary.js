export function getImageUrl(path, width) {
    if (!path) return "/placeholder.jpg"; 

    if (path.startsWith("http")) return path;

    // Normalizar si no viene con el prefijo cloud o si viene redundante
    let cleanPath = path;

    // fix para casos donde la DB tenía grabado "drivers/xxx.jpg" o solo "xxx.jpg" pero en component se ponía la carpeta. 
    // Para simplificar, asumiremos que se le pasa el relative_path ej: drivers/leclerc.png o grandpick/drivers/...
    if (!cleanPath.startsWith("grandpick/")) {
        cleanPath = `grandpick/${cleanPath}`;
    }

    // A veces los componentes tenían /api/static/drivers/${img} y ahora pasaremos solo driver/${img} si hace falta.
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.warn("Falta VITE_CLOUDINARY_CLOUD_NAME en el archivo .env");
    }
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${cleanPath}`;
}
