export const CLOUDINARY_DEFAULTS = {
    PROFILE: "profile_default.png",
    EMPTY: "imagen_vacia.png",
    LOGO: "logo_grandpick.svg",
    VERSION: "v2" // Incrementa esto (v3, v4...) para limpiar el caché si cambias una imagen conservando el mismo nombre
};

export function getImageUrl(path, width, type = "empty") {
    // Si no hay path, usar directamente la imagen por defecto correspondiente
    if (!path) {
        return getImageUrl(type === "profile" ? CLOUDINARY_DEFAULTS.PROFILE : CLOUDINARY_DEFAULTS.EMPTY, width);
    }

    if (path.startsWith("http")) return path;

    // Ruta limpia
    let cleanPath = path;

    // Mapeo de nombres viejos
    if (cleanPath === "profile_default.png" || cleanPath === "general/profile_default.png") {
        cleanPath = CLOUDINARY_DEFAULTS.PROFILE;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.warn("Falta VITE_CLOUDINARY_CLOUD_NAME en el archivo .env");
    }
    
    // Elegir el "Default" de Cloudinary
    // d_NombreDelArchivo: le dice a Cloudinary que si no existe la ruta, devuelva este archivo
    const defaultImg = type === "profile" ? CLOUDINARY_DEFAULTS.PROFILE : CLOUDINARY_DEFAULTS.EMPTY;
    const defaultTransform = `d_${defaultImg}`;

    const widthTransform = width ? `,w_${width}` : "";
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${defaultTransform},f_auto,q_auto${widthTransform}/${CLOUDINARY_DEFAULTS.VERSION}/${cleanPath}`;
}
