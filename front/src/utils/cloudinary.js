export const CLOUDINARY_DEFAULTS = {
    PROFILE: "profile_default.png",
    EMPTY: "imagen_no_encontrada.png",
    LOGO: "logo_grandpick.svg",
    VERSION: "v2"
};

export function getImageUrl(path, width, type = "empty") {

    if (!path) {
        return getImageUrl(type === "profile" ? CLOUDINARY_DEFAULTS.PROFILE : CLOUDINARY_DEFAULTS.EMPTY, width);
    }

    if (path.startsWith("http")) return path;

    let cleanPath = path;

    if (cleanPath === "profile_default.png" || cleanPath === "general/profile_default.png") {
        cleanPath = CLOUDINARY_DEFAULTS.PROFILE;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.warn("Falta VITE_CLOUDINARY_CLOUD_NAME en el archivo .env");
    }

    const defaultImg = type === "profile" ? CLOUDINARY_DEFAULTS.PROFILE : CLOUDINARY_DEFAULTS.EMPTY;
    const defaultTransform = `d_${defaultImg}`;

    const widthTransform = width ? `,w_${width}` : "";

    return `https://res.cloudinary.com/${cloudName}/image/upload/${defaultTransform},f_auto,q_auto${widthTransform}/${CLOUDINARY_DEFAULTS.VERSION}/${cleanPath}`;
}
