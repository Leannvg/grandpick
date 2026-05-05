import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import circuitsServices from "../services/circuits.services";
import * as countriesServices from "../services/countries.services";
import { useLoader } from "../context/LoaderContext";
import { getFlagEmoji } from "../utils/helpers";

function Circuits() {
    const [circuits, setCircuits] = useState([]);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadCircuits() {
            showLoader();
            try {
                const data = await circuitsServices.findAll();

                // Fetch country names using global map
                let countriesMap = {};
                try {
                    const countriesList = await countriesServices.getCountries();
                    countriesList.forEach(c => countriesMap[c.iso2] = c.name);
                } catch (err) {
                    console.error("Error fetching global countries list:", err);
                }

                const circuitsWithNames = data.map(circuit => {
                    return { ...circuit, country_name: countriesMap[circuit.country] || circuit.country };
                });

                setCircuits(circuitsWithNames);
            } catch (error) {
                console.error("Error al obtener los circuitos:", error);
            } finally {
                hideLoader();
            }
        }

        loadCircuits();
    }, []);

    return (

        <section className="circuits-section page-section container text-center">
            <header className="page-header">
                <p className="section-label">Los templos de la velocidad</p>
                <h1 className="section-title">CIRCUITOS</h1>
                <p className="section-subtitle">
                    Cada pista, un desafío distinto
                </p>
            </header>
            <div className="container">
                {circuits.map((circuit) => (

                    <Link to={`/circuits/${circuit._id}`} className="text-decoration-none">
                        <article className="circuit-card">
                            <div className="circuit-info text-start">
                                <h3 className="circuit-name">{circuit.circuit_name}</h3>

                                <div className="circuit-country">
                                    <span className="emoji-flag me-2">{getFlagEmoji(circuit.country)}</span>
                                    <span>{circuit.country_name}</span>
                                </div>
                            </div>

                            <div className="circuit-length">
                                <span className="length-value">{circuit.length} km</span>
                                <span className="length-label">Longitud</span>
                            </div>
                        </article>
                    </Link>

                ))}
            </div>
        </section>

    );
}

export default Circuits;
