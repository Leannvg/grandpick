export const CLOUDINARY_DEFAULTS = {
    PROFILE: "profile_default.png",
    EMPTY: "imagen_vacia.png",
    LOGO: "logo_grandpick.svg"
};

export function getImageUrl(path, width) {
    // Si no hay path, usar la imagen vacía por defecto de Cloudinary
    if (!path) {
        return getImageUrl(CLOUDINARY_DEFAULTS.EMPTY, width);
    }

    if (path.startsWith("http")) return path;

    // Ya no forzamos el prefijo "grandpick/", usamos la ruta tal cual viene
    // Si la imagen está en una carpeta, se debe pasar como "carpeta/imagen"
    let cleanPath = path;

    // Si viene el nombre viejo de la imagen de perfil, mapear al nuevo path de Cloudinary
    if (cleanPath === "profile_default.png" || cleanPath === "general/profile_default.png") {
        cleanPath = CLOUDINARY_DEFAULTS.PROFILE;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.warn("Falta VITE_CLOUDINARY_CLOUD_NAME en el archivo .env");
    }
    
    // Si no se especifica width, usar transformaciones automáticas sin resize específico
    const widthTransform = width ? `,w_${width}` : "";
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto${widthTransform}/${cleanPath}`;
}
