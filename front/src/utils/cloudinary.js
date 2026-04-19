export const CLOUDINARY_DEFAULTS = {
    PROFILE: "defaults/profile_default",
    EMPTY: "defaults/imagen_vacia"
};

export function getImageUrl(path, width) {
    // Si no hay path, usar la imagen vacía por defecto de Cloudinary
    if (!path) {
        return getImageUrl(CLOUDINARY_DEFAULTS.EMPTY, width);
    }

    if (path.startsWith("http")) return path;

    // Normalizar si no viene con el prefijo cloud o si viene redundante
    let cleanPath = path;

    // Si viene el nombre viejo de la imagen de perfil, mapear al nuevo path de Cloudinary
    if (cleanPath === "profile_default.png" || cleanPath === "general/profile_default.png") {
        cleanPath = CLOUDINARY_DEFAULTS.PROFILE;
    }

    // fix para casos donde la DB tenía grabado "drivers/xxx.jpg" o solo "xxx.jpg" pero en component se ponía la carpeta. 
    // Para simplificar, asumiremos que se le pasa el relative_path ej: drivers/leclerc.png o grandpick/drivers/...
    if (!cleanPath.startsWith("grandpick/")) {
        cleanPath = `grandpick/${cleanPath}`;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.warn("Falta VITE_CLOUDINARY_CLOUD_NAME en el archivo .env");
    }
    
    // Si no se especifica width, usar transformaciones automáticas sin resize específico
    const widthTransform = width ? `,w_${width}` : "";
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto${widthTransform}/${cleanPath}`;
}
