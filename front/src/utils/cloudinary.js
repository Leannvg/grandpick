export const CLOUDINARY_DEFAULTS = {
    PROFILE: "profile_default.png",
    EMPTY: "imagen_no_encontrada.png",
    LOGO: "logo_grandpick.svg",
    VERSION: "v2"
};

// Pedido: "la calidad de la imagen del banner se redujo... en el laboratorio
// se veía de mejor calidad". El laboratorio mostraba el mock con <img> directo
// (sin pasar por Cloudinary); acá el q_auto de siempre (nivel "good" por
// default) se nota de más en una foto grande y protagonista como esta —
// `quality` deja pedir un nivel más alto (ej. "auto:best") solo donde haga
// falta, sin tocar el q_auto de siempre en el resto de los usos (logos,
// avatares, thumbnails, donde no se nota y no vale la pena el peso extra).
export function getImageUrl(path, width, type = "empty", quality = "auto") {

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

    return `https://res.cloudinary.com/${cloudName}/image/upload/${defaultTransform},f_auto,q_${quality}${widthTransform}/${CLOUDINARY_DEFAULTS.VERSION}/${cleanPath}`;
}
