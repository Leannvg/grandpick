import { getFlagEmoji, formatRaceDate } from "../../utils/helpers";
import "../../assets/styles/predictionCompare.css";

/**
 * Card oscura con el dato del GP (bandera + nombre + circuito, y la fecha a la
 * derecha). Reutilizada en el modal de comparación (FloatingPredictionCompare)
 * y en el drawer mobile del historial. `formatRaceDate` devuelve "8-10 OCTUBRE"
 * en un solo string, acá se separa en dos líneas (día / mes).
 */
function GpCard({ circuit, dateStart, dateEnd }) {
    if (!circuit) return null;

    const dateLabel = formatRaceDate(dateStart, dateEnd);
    const [dateDay, ...dateMonthParts] = (dateLabel || "").split(" ");
    const dateMonth = dateMonthParts.join(" ");

    return (
        <div className="cmp-gp-card">
            <div className="cmp-gp-card__info">
                <div className="cmp-gp-card__loc">
                    <span className="emoji-flag">{getFlagEmoji(circuit.country)}</span>
                    <span className="cmp-gp-card__country">{circuit.gp_name}</span>
                </div>
                {circuit.circuit_name && (
                    <p className="cmp-gp-card__circuit">{circuit.circuit_name}</p>
                )}
            </div>
            {dateLabel && dateLabel !== "N/A" && (
                <div className="cmp-gp-card__date">
                    <span className="d">{dateDay}</span>
                    <span className="m">{dateMonth}</span>
                </div>
            )}
        </div>
    );
}

export default GpCard;
