import { useEffect, useState, useMemo } from "react";
import { useLoader } from "../context/LoaderContext";
import DriversServices from "../services/drivers.services";
import TeamsServices from "../services/teams.services";
import Podium from "../components/Podium";
import CountryDisplay from "../components/CountryDisplay";
import "../assets/styles/ranking.css";
import "../assets/styles/standings.css";

function Standings() {
    const [mode, setMode] = useState("drivers");
    const [standings, setStandings] = useState([]);
    const [constructorsStandings, setConstructorsStandings] = useState([]);
    const [unresolvedResults, setUnresolvedResults] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        if (mode !== "drivers") return;
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
    }, [mode, selectedYear]);

    useEffect(() => {
        if (mode !== "constructors") return;
        const fetchConstructors = async () => {
            showLoader();
            try {
                const data = await TeamsServices.findConstructorsStandings(selectedYear);
                setConstructorsStandings(Array.isArray(data?.standings) ? data.standings : []);
                setUnresolvedResults(data?.unresolvedResults || 0);
            } catch (error) {
                console.error("Error al cargar la clasificación de constructores:", error);
                setConstructorsStandings([]);
                setUnresolvedResults(0);
            } finally {
                hideLoader();
            }
        };

        fetchConstructors();
    }, [mode, selectedYear]);

    const filteredStandings = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return standings;
        return standings.filter((d) => {
            const name = (d.full_name || "").toLowerCase();
            const team = (d.team?.name || "").toLowerCase();
            return name.includes(term) || team.includes(term);
        });
    }, [standings, searchTerm]);

    const filteredConstructors = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return constructorsStandings;
        return constructorsStandings.filter((t) =>
            (t.name || "").toLowerCase().includes(term)
        );
    }, [constructorsStandings, searchTerm]);

    const splitName = (fullName = "") => {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 0) return { first: "", last: "" };
        const [first, ...rest] = parts;
        const capitalized = first
            ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
            : "";
        return { first: capitalized, last: rest.join(" ") };
    };

    const driversPodiumEntries = standings.slice(0, 3).map((d, i) => {
        const { first, last } = splitName(d.full_name);
        return {
            id: d._id,
            rank: i + 1,
            firstName: first,
            lastName: last,
            country: d.country,
            points: d.points,
            img: d.img,
            subtitle: d.team?.name,
        };
    });

    const constructorsPodiumEntries = constructorsStandings.slice(0, 3).map((t, i) => ({
        id: t._id,
        rank: i + 1,
        firstName: t.name,
        lastName: "",
        points: t.points,
        img: t.isologo,
    }));

    const podiumEntries = mode === "drivers" ? driversPodiumEntries : constructorsPodiumEntries;

    const years = Array.from(
        { length: new Date().getFullYear() - 2024 + 1 },
        (_, i) => new Date().getFullYear() - i
    );

    return (
        <div className="standings-page ranking-page page-wrapper">
            <section className="page-section container-fluid px-3 px-md-5 text-center container">
                <header className="page-header">
                    <p className="section-label">Temporada actual</p>
                    <h1 className="section-title">
                        {mode === "drivers" ? "CLASIFICACIÓN DE PILOTOS" : "CLASIFICACIÓN DE CONSTRUCTORES"}
                    </h1>
                    <p className="section-subtitle">
                        Puntos sumados en el campeonato (Carrera + Sprint)
                    </p>
                </header>

                <div className="standings-mode-toggle d-flex justify-content-center gap-2 mb-4">
                    <button
                        className={`info-page__mode-btn btn-mode ${mode === "drivers" ? "is-active" : ""}`}
                        onClick={() => setMode("drivers")}
                    >
                        Pilotos
                    </button>
                    <button
                        className={`info-page__mode-btn btn-mode ${mode === "constructors" ? "is-active" : ""}`}
                        onClick={() => setMode("constructors")}
                    >
                        Constructores
                    </button>
                </div>

                <Podium key={`${mode}-${selectedYear}`} entries={podiumEntries} />

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
                            placeholder={mode === "drivers" ? "Piloto o escudería" : "Escudería"}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {mode === "constructors" && unresolvedResults > 0 && (
                    <div className="alert alert-warning text-start mb-3">
                        Hay {unresolvedResults} resultado{unresolvedResults === 1 ? "" : "s"} de carreras
                        cargadas sin escudería confirmada; esos puntos todavía no están sumados acá.
                    </div>
                )}

                <div className="ranking-card">
                    <div className="ranking-table-container table-responsive">
                        {mode === "drivers" ? (
                            <table className="ranking-table standings-table">
                                <thead>
                                    <tr>
                                        <th className="w-50px">Pos.</th>
                                        <th className="text-start">Piloto</th>
                                        <th className="text-start">Nacionalidad</th>
                                        <th className="text-start">Equipo Actual</th>
                                        <th className="w-120px">Puntos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStandings.map((driver) => {
                                        const pos = driver.position;
                                        const posClass = pos <= 3 ? `pos-${pos}` : "";
                                        const { first, last } = splitName(driver.full_name);

                                        return (
                                            <tr key={driver._id}>
                                                <td className={`pos-cell ${posClass}`}>{pos}</td>
                                                <td className="text-start">
                                                    <div className="driver-cell">
                                                        <span className="driver-firstname">{first}</span>
                                                        <span className="driver-lastname">{last}</span>
                                                    </div>
                                                </td>
                                                <td className="text-start">
                                                    <CountryDisplay iso2={driver.country} />
                                                </td>
                                                <td className="text-start">
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
                        ) : (
                            <table className="ranking-table standings-table">
                                <thead>
                                    <tr>
                                        <th className="w-50px">Pos.</th>
                                        <th className="text-start">Escudería</th>
                                        <th className="w-120px">Puntos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredConstructors.map((team) => {
                                        const pos = team.position;
                                        const posClass = pos <= 3 ? `pos-${pos}` : "";

                                        return (
                                            <tr key={team._id}>
                                                <td className={`pos-cell ${posClass}`}>{pos}</td>
                                                <td className="text-start">
                                                    <div
                                                        className="team-cell"
                                                        style={{ "--team-color": team.color || "#5c8ab3" }}
                                                    >
                                                        <span className="team-color-dot" />
                                                        <span>{team.name}</span>
                                                    </div>
                                                </td>
                                                <td className="points-cell">
                                                    <strong>{team.points}</strong>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredConstructors.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="ranking-empty-state">
                                                No hay datos de clasificación para esta temporada
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Standings;
