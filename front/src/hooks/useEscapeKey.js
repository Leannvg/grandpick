import { useEffect } from "react";

/**
 * Cierra un modal/drawer con la tecla Escape (desktop).
 * Agrega el listener de `keydown` en `document` solo mientras `isActive`
 * es true, y lo limpia al desmontar o cuando `isActive` pasa a `false`.
 *
 * @param {boolean} isActive - Si el modal/drawer está abierto.
 * @param {() => void} onEscape - Callback de cierre (ej. `onClose`/`onCancel`).
 */
export function useEscapeKey(isActive, onEscape) {
    useEffect(() => {
        if (!isActive) return;

        function handleKeyDown(e) {
            if (e.key === "Escape") {
                onEscape?.();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isActive, onEscape]);
}
