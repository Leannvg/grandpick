import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import circuitsServices from "../services/circuits.services";
import * as countriesServices from "../services/countries.services";
import { useLoader } from "../context/LoaderContext";
import { getFlagEmoji } from "../utils/helpers";
import { getImageUrl } from "../utils/cloudinary";

function Circuits() {
    const [circuits, setCircuits] = useState([]);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadCircuits() {
            showLoader();
            try {
                const data = await circuitsServices.findAll();

                // Obtener nombres de países usando el mapa global
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
        <div className="circuits-page page-wrapper">
            <section className="page-section container text-center">
            <header className="page-header">
                <p className="section-label">Los templos de la velocidad</p>
                <h1 className="section-title">CIRCUITOS</h1>
                <p className="section-subtitle">
                    Cada pista, un desafío distinto
                </p>
            </header>
            <div className="container circuits-grid">
                {circuits.map((circuit) => (
                    <Link to={`/circuits/${circuit._id}`} className="text-decoration-none" key={circuit._id}>
                        <article className="track-card">
                            <div className="track-card-header">
                                <img 
                                    src={getImageUrl(circuit.img, 500)} 
                                    alt={circuit.circuit_name} 
                                    className="track-card-image"
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/500x300?text=Circuito"; }}
                                />
                                <div className="track-card-badge">
                                    <span className="emoji-flag me-1">{getFlagEmoji(circuit.country)}</span>
                                    {circuit.country_name}
                                </div>
                            </div>
                            <div className="track-card-body">
                                <h2 className="track-card-title">{circuit.gp_name || circuit.circuit_name}</h2>
                                <p className="track-card-subtitle">{circuit.circuit_name}</p>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
            </section>
        </div>
    );
}

export default Circuits;
