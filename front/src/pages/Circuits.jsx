import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import circuitsServices from "../services/circuits.services";
import countriesServices from "../services/countries.services";
import { useLoader } from "../context/LoaderContext";

function Circuits() {
    const [circuits, setCircuits] = useState([]);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadCircuits() {
            showLoader();
            try {
                const data = await circuitsServices.findAll();

                // Fetch flags for each circuit
                const circuitsWithFlags = await Promise.all(
                    data.map(async (circuit) => {
                        try {
                            const country = await countriesServices.getOneCountry(circuit.country);
                            return { ...circuit, emoji: country?.emoji || "🏁", country_name: country?.name || circuit.country };
                        } catch (err) {
                            console.error(`Error fetching country for ${circuit.country}:`, err);
                            return { ...circuit, emoji: "🏁", country_name: circuit.country };
                        }
                    })
                );

                setCircuits(circuitsWithFlags);
            } catch (error) {
                console.error("Error al obtener los circuitos:", error);
            } finally {
                hideLoader();
            }
        }

        loadCircuits();
    }, []);

    return (
        <main>
            <section className="circuits-section page-section container text-center">
                <header className="page-header">
                    <p className="section-label">Los templos de la velocidad</p>
                    <h1 className="section-title">CIRCUITOS</h1>
                    <p className="section-subtitle">
                        Cada pista, un desafío distinto
                    </p>
                </header>
                <div className="container">
                    <div className="row g-4 justify-content-center">
                        {circuits.map((circuit) => (
                            <div className="col-12" key={circuit._id}>
                                <Link to={`/circuits/${circuit._id}`} className="text-decoration-none">
                                    <article className="circuit-card">
                                        <div className="circuit-info text-start">
                                            <h3 className="circuit-name">{circuit.circuit_name}</h3>

                                            <div className="circuit-country">
                                                <span className="emoji-flag me-2">{circuit.emoji}</span>
                                                <span>{circuit.country_name}</span>
                                            </div>
                                        </div>

                                        <div className="circuit-length">
                                            <span className="length-value">{circuit.length} km</span>
                                            <span className="length-label">Longitud</span>
                                        </div>
                                    </article>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Circuits;
