import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import circuitsServices from "../services/circuits.services";
import racesServices from "../services/races.services";
import * as countriesServices from "../services/countries.services";
import { useLoader } from "../context/LoaderContext";
import { formatRaceDate } from "../utils/helpers";
import API_URL from "../services/api";

function CircuitDetail() {
    const { id } = useParams();
    const [circuit, setCircuit] = useState(null);
    const [race, setRace] = useState(null);
    const [emoji, setEmoji] = useState("🏁");
    const [countryName, setCountryName] = useState("");
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadCircuitData() {
            showLoader();
            try {
                const circuitData = await circuitsServices.findOne(id);
                setCircuit(circuitData);

                // Fetch country info
                try {
                    const country = await countriesServices.getOneCountry(circuitData.country);
                    setEmoji(country?.emoji || "🏁");
                    setCountryName(country?.name || circuitData.country);
                } catch (err) {
                    console.error("Error fetching country:", err);
                    setCountryName(circuitData.country);
                }

                // Try to find a race for this circuit to get the date
                try {
                    const allRaces = await racesServices.findAll();
                    const circuitRace = allRaces.find(r => r.id_circuit === id || r.circuit?._id === id);
                    if (circuitRace) {
                        setRace(circuitRace);
                    }
                } catch (err) {
                    console.error("Error fetching races for circuit date:", err);
                }

            } catch (error) {
                console.error("Error al obtener el detalle del circuito:", error);
            } finally {
                hideLoader();
            }
        }

        loadCircuitData();
    }, [id]);

    if (!circuit) return null;

    return (
        <main>
            <section className="circuits-section page-section container text-center">
                <article className="circuit-detail">
                    {/* HEADER */}
                    <header className="page-header">
                        <span className="circuit-country-detail section-label">
                            <span className="emoji-flag me-2">{emoji}</span>
                            {countryName.toUpperCase()}
                        </span>
                        <h1 className="section-title">{circuit.circuit_name}</h1>
                        {race && (
                            <p className="section-subtitle">
                                {formatRaceDate(race.date_gp_start, race.date_gp_end)}
                            </p>
                        )}
                    </header>

                    {/* TRACK MAP */}
                    <div className="circuit-map">
                        <img
                            src={`${API_URL}/storage/${circuit.img}`}
                            alt={circuit.circuit_name}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=Circuito"; }}
                        />
                    </div>

                    {/* STATS */}
                    <section className="circuit-stats">
                        <div className="stat-card">
                            <span className="stat-value">{circuit.laps || "N/A"}</span>
                            <span className="stat-label">Número de vueltas</span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-value">
                                {circuit.laps && circuit.length ? (parseInt(circuit.laps) * parseFloat(circuit.length)).toFixed(3) : "N/A"} km
                            </span>
                            <span className="stat-label">Distancia de carrera</span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-value">{circuit.length || "N/A"} km</span>
                            <span className="stat-label">Longitud de circuito</span>
                        </div>
                    </section>

                    {/* DESCRIPTION */}
                    <section className="circuit-description text-start mt-4">
                        <p>{circuit.description}</p>
                    </section>
                </article>
            </section>
        </main>
    );
}

export default CircuitDetail;
