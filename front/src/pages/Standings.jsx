import { useEffect, useState, useMemo } from "react";
import { useLoader } from "../context/LoaderContext";
import DriversServices from "../services/drivers.services";
import CountryDisplay from "../components/CountryDisplay";
import "../assets/styles/ranking.css";
import "../assets/styles/standings.css";

function Standings() {
    const [standings, setStandings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        const fetchStandings = async () => {
            showLoader();
            try {
                const data = await DriversServices.findDriversStandings(selectedYear);
                setStandings(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar la clasificación de pilotos:", error);
                setStandings([]);
            } finally {
                hideLoader();
            }
        };

        fetchStandings();
    }, [selectedYear]);

    const filteredStandings = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return standings;
        return standings.filter((d) => {
            const name = (d.full_name || "").toLowerCase();
            const team = (d.team?.name || "").toLowerCase();
            return name.includes(term) || team.includes(term);
        });
    }, [standings, searchTerm]);

    const years = Array.from(
        { length: new Date().getFullYear() - 2024 + 1 },
        (_, i) => new Date().getFullYear() - i
    );

    return (
        <div className="standings-page ranking-page page-wrapper">
            <section className="page-section container-fluid px-3 px-md-5 text-center container">
                <header className="page-header">
                    <p className="section-label">Temporada actual</p>
                    <h1 className="section-title">CLASIFICACIÓN DE PILOTOS</h1>
                    <p className="section-subtitle">
                        Puntos sumados en el campeonato (Carrera + Sprint)
                    </p>
                </header>

                <div className="standings-filters">
                    <div className="ranking-input-group h-38px">
                        <span className="ranking-input-group-text">Año</span>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ranking-input-group h-38px">
                        <span className="ranking-input-group-text">Buscar</span>
                        <input
                            type="text"
                            className="standings-search__input"
                            placeholder="Piloto o escudería"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="ranking-card">
                    <div className="ranking-table-container table-responsive">
                        <table className="ranking-table standings-table">
                            <thead>
                                <tr>
                                    <th className="w-50px">Pos.</th>
                                    <th className="text-start">Nombre</th>
                                    <th>Nacionalidad</th>
                                    <th>Equipo Actual</th>
                                    <th className="w-120px">Puntos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStandings.map((driver) => {
                                    const pos = driver.position;
                                    const posClass = pos <= 3 ? `pos-${pos}` : "";

                                    return (
                                        <tr key={driver._id}>
                                            <td className={`pos-cell ${posClass}`}>{pos}</td>
                                            <td className="text-start">
                                                <div className="driver-cell">
                                                    {driver.number && (
                                                        <span className="driver-number">
                                                            {driver.number}
                                                        </span>
                                                    )}
                                                    <span className="driver-name">
                                                        {driver.full_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <CountryDisplay iso2={driver.country} />
                                            </td>
                                            <td>
                                                <div
                                                    className="team-cell"
                                                    style={{ "--team-color": driver.team?.color || "#5c8ab3" }}
                                                >
                                                    <span className="team-color-dot" />
                                                    <span>{driver.team?.name || "Sin escudería"}</span>
                                                </div>
                                            </td>
                                            <td className="points-cell">
                                                <strong>{driver.points}</strong>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredStandings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="ranking-empty-state">
                                            No hay datos de clasificación para esta temporada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Standings;
