import { useEffect, useState, useMemo } from "react";
import { useLoader } from "../context/LoaderContext";
import UsersServices from "../services/users.services";
import PredictionsServices from "../services/predictions.services";
import RacesServices from "../services/races.services";
import { getFlagEmoji } from "../utils/helpers";
import { usePagination } from "../hooks/usePagination";
import { getCountries } from "../services/countries.services";
import SearchableSelect from "../components/SearchableSelect";
import "../assets/styles/ranking.css";

function Ranking() {
    const [stats, setStats] = useState([]);
    const [currentUserStat, setCurrentUserStat] = useState(null);
    const { showLoader, hideLoader } = useLoader();
    const [searchTerm, setSearchTerm] = useState("");
    const [countriesMap, setCountriesMap] = useState({});

    const [mode, setMode] = useState("global");
    const [racesList, setRacesList] = useState([]);
    const [selectedCircuitId, setSelectedCircuitId] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchRacesList = async () => {
            if (mode !== "grand_prix") return;
            try {
                const allRaces = await RacesServices.findAllByYear(selectedYear);
                const circuitsData = [];
                const seen = new Set();
                allRaces.forEach(r => {
                    const cid = r.id_circuit || r.circuit?._id;
                    if (cid && !seen.has(cid)) {
                        seen.add(cid);
                        const hasResults = r.results && r.results.length > 0;
                        const isFinished = r.state === 'Finalizado';
                        circuitsData.push({
                            _id: cid,
                            id: cid,
                            name: r.circuit?.circuit_name || "Circuito Desconocido",
                            country: r.circuit?.country,
                            emoji: getFlagEmoji(r.circuit?.country),
                            enabled: hasResults || isFinished,
                            date_gp_start: r.date_gp_start || new Date().toISOString()
                        });
                    } else if (cid && seen.has(cid)) {
                        // Si ya lo agregamos pero hay otra sesión de este GP con resultados, lo habilitamos
                        const hasResults = r.results && r.results.length > 0;
                        const isFinished = r.state === 'Finalizado';
                        const existing = circuitsData.find(c => c.id === cid);
                        if (existing) {
                            if (hasResults || isFinished) {
                                existing.enabled = true;
                            }
                            if (r.date_gp_start && new Date(r.date_gp_start) < new Date(existing.date_gp_start)) {
                                existing.date_gp_start = r.date_gp_start;
                            }
                        }
                    }
                });
                
                // Ordenar por fecha de inicio
                circuitsData.sort((a, b) => new Date(a.date_gp_start) - new Date(b.date_gp_start));
                setRacesList(circuitsData);

                // Autoselect the last enabled circuit if none is selected or if the selected one is not in the list
                const enabledCircuits = circuitsData.filter(c => c.enabled);
                if (enabledCircuits.length > 0 && (!selectedCircuitId || !circuitsData.find(c => c.id === selectedCircuitId))) {
                    setSelectedCircuitId(enabledCircuits[enabledCircuits.length - 1].id);
                } else if (enabledCircuits.length === 0) {
                    setSelectedCircuitId("");
                }
            } catch (error) {
                console.error("Error fetching races list:", error);
            }
        };
        fetchRacesList();
    }, [mode, selectedYear]);

    useEffect(() => {
        const fetchStats = async () => {
            showLoader();
            try {
                const profile = await UsersServices.getUserProfile();

                if (mode === "global") {
                    const data = await UsersServices.getAllUsersStats();
                    const sortedData = [...data].sort((a, b) => {
                        const pointsA = a.stats?.points?.total || 0;
                        const pointsB = b.stats?.points?.total || 0;
                        if (pointsB !== pointsA) return pointsB - pointsA;

                        const successesA = a.stats?.successes?.total || 0;
                        const successesB = b.stats?.successes?.total || 0;
                        if (successesB !== successesA) return successesB - successesA;

                        const avgA = a.stats?.predictions?.total > 0 ? pointsA / a.stats.predictions.total : 0;
                        const avgB = b.stats?.predictions?.total > 0 ? pointsB / b.stats.predictions.total : 0;
                        if (avgB !== avgA) return avgB - avgA;

                        // COUNTBACK: Desempate por mejores fines de semana (estilo F1)
                        const scoresA = a.stats?.bestScores || [];
                        const scoresB = b.stats?.bestScores || [];
                        const maxLength = Math.max(scoresA.length, scoresB.length);

                        for (let i = 0; i < maxLength; i++) {
                            const scoreA = scoresA[i] || 0;
                            const scoreB = scoresB[i] || 0;
                            if (scoreA !== scoreB) {
                                return scoreB - scoreA;
                            }
                        }

                        return 0; // Empate absoluto
                    }).map((item, index) => ({
                        ...item,
                        globalRank: index + 1
                    }));

                    setStats(sortedData);

                    if (profile) {
                        const userFound = sortedData.find(u => u._id === profile._id);
                        if (userFound) {
                            setCurrentUserStat(userFound);
                        } else {
                            setCurrentUserStat(null);
                        }
                    }
                } else if (mode === "grand_prix") {
                    if (!selectedCircuitId) {
                        setStats([]);
                        setCurrentUserStat(null);
                    } else {
                        const data = await PredictionsServices.getGrandPrixRanking(selectedCircuitId, selectedYear);
                        setStats(data);
                        if (profile) {
                            const userFound = data.find(u => u._id === profile._id);
                            if (userFound) {
                                setCurrentUserStat(userFound);
                            } else {
                                setCurrentUserStat(null);
                            }
                        }
                    }
                }

                // Cargar mapa de países
                try {
                    const countriesList = await getCountries();
                    const map = {};
                    countriesList.forEach(c => map[c.iso2] = c.name);
                    setCountriesMap(map);
                } catch (err) {
                    console.error("Error al cargar mapa de países:", err);
                }

            } catch (error) {
                console.error("Error al cargar el ranking:", error);
            } finally {
                hideLoader();
            }
        };

        fetchStats();
    }, [mode, selectedCircuitId, selectedYear]);

    const filteredStats = useMemo(() => {
        return stats.filter(userStat => {
            const fullName = `${userStat.name} ${userStat.last_name}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });
    }, [stats, searchTerm]);

    const {
        page,
        pageSize,
        setPage,
        setPageSize,
        totalPages,
        paginatedData
    } = usePagination(filteredStats, 20);

    return (
        <section className="ranking-page page-section container-fluid px-3 px-md-5 text-center container">
            <header className="page-header">
                <p className="section-label">Todos quieren subirse al podio</p>
                <h1 className="section-title">{mode === 'global' ? 'PUNTUACIÓN GLOBAL' : 'PUNTUACIÓN POR GRAN PREMIO'}</h1>
                <p className="section-subtitle">Campeonato de predicciones</p>
            </header>

            <div className="ranking-filters">
                {/* Row 1: Filters & Mode Buttons */}
                <div className="row w-100 m-0 g-2 justify-content-between align-items-center">

                    {/* Mobile Bottom / Desktop Left: Mostrar & Año */}
                    <div className="col-12 col-md-auto order-2 order-md-1 px-0 m-0">
                        <div className="row g-2 m-0 w-100">
                            <div className="col-6 col-md-auto px-1 px-md-0 me-md-2">
                                <div className="ranking-input-group w-100" style={{ height: '38px' }}>
                                    <span className="ranking-input-group-text">Mostrar</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="w-100"
                                    >
                                        <option value={2}>2</option>
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={filteredStats.length}>Todos</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-6 col-md-auto px-1 px-md-0">
                                <div className="ranking-input-group w-100" style={{ height: '38px' }}>
                                    <span className="ranking-input-group-text">Año</span>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => {
                                            setSelectedYear(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="w-100"
                                    >
                                        {Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Top / Desktop Right: Mode Buttons */}
                    <div className="col-12 col-md-auto order-1 order-md-2 px-0 m-0">
                        <div className="row g-2 m-0 w-100 justify-content-end h-100">
                            <div className="col-6 col-md-auto px-1 px-md-0 ms-md-2 d-flex">
                                <button
                                    className={`info-page__mode-btn w-100 m-0 ${mode === 'global' ? 'is-active' : ''}`}
                                    onClick={() => setMode('global')}
                                    style={{ height: '38px', padding: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                                >
                                    Global
                                </button>
                            </div>
                            <div className="col-6 col-md-auto px-1 px-md-0 ms-md-2 d-flex d-md-none">
                                <button
                                    className={`info-page__mode-btn w-100 m-0 ${mode === 'grand_prix' ? 'is-active' : ''}`}
                                    onClick={() => {
                                        setMode('grand_prix');
                                        setPage(1);
                                    }}
                                    style={{ height: '38px', padding: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                                >
                                    GP
                                </button>
                            </div>
                            <div className="col-6 col-md-auto px-1 px-md-0 ms-md-2 d-none d-md-flex">
                                <button
                                    className={`info-page__mode-btn w-100 m-0 ${mode === 'grand_prix' ? 'is-active' : ''}`}
                                    onClick={() => {
                                        setMode('grand_prix');
                                        setPage(1);
                                    }}
                                    style={{ height: '38px', padding: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                                >
                                    Por Gran Premio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Secondary Row (Circuito, TU PUESTO, Buscador) */}
                <div className="d-flex flex-column flex-md-row w-100 gap-2 mb-3">

                    {/* Circuito (Only in GP Mode) */}
                    {mode === 'grand_prix' && (
                        <div className="order-3 order-md-1 flex-md-fill" style={{ minWidth: '200px' }}>
                            <div className="ranking-input-group w-100 m-0" style={{ height: '44px' }}>
                                <span className="ranking-input-group-text">Circuito</span>
                                <div style={{ flexGrow: 1, height: '100%' }}>
                                    <SearchableSelect
                                        options={racesList}
                                        value={selectedCircuitId}
                                        onChange={(selected) => {
                                            setSelectedCircuitId(selected.value);
                                            setPage(1);
                                        }}
                                        getOptionDisabled={(opt) => !opt.enabled}
                                        placeholder="Seleccionar Gran Premio"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TU PUESTO */}
                    {currentUserStat && !searchTerm && (
                        <div className="order-2 order-md-2 flex-md-fill" style={{ minWidth: '250px' }}>
                            <div className="ranking-user-status w-100 m-0 h-100" style={{ minHeight: '44px' }}>
                                <div className="ranking-user-status__content">
                                    <div className="status-item status-item--rank">
                                        <span className="status-label">TU PUESTO</span>
                                        <span className="status-value">#{currentUserStat.globalRank}</span>
                                    </div>

                                    <div className="status-item status-item--user">
                                        <span className="status-label">USUARIO</span>
                                        <span className="status-value">{currentUserStat.name} {currentUserStat.last_name}</span>
                                    </div>

                                    <div className="status-item status-item--points">
                                        <span className="status-label">PUNTOS</span>
                                        <span className="status-value">{mode === 'global' ? (currentUserStat.stats?.points?.total || 0) : currentUserStat.points}</span>
                                    </div>

                                    <button
                                        className="btn-jump-to-me"
                                        title="Ir a mi posición"
                                        onClick={() => {
                                            if (!currentUserStat) return;

                                            const userIndex = filteredStats.findIndex(u => u._id === currentUserStat._id);
                                            if (userIndex === -1) return;

                                            const targetPage = Math.floor(userIndex / pageSize) + 1;

                                            if (page !== targetPage) {
                                                setPage(targetPage);
                                            }

                                            setTimeout(() => {
                                                const element = document.getElementById(`user-row-${currentUserStat._id}`);
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    element.classList.add('row-highlight-pulse');
                                                    setTimeout(() => {
                                                        element.classList.remove('row-highlight-pulse');
                                                    }, 3000);
                                                }
                                            }, page !== targetPage ? 300 : 50);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BUSCADOR */}
                    <div className="order-1 order-md-3 flex-md-fill" style={{ minWidth: '200px' }}>
                        <div className="ranking-search w-100 m-0" style={{ height: '44px', maxWidth: 'none' }}>
                            <input
                                type="text"
                                placeholder="Buscador"
                                className="ranking-search__input w-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="ranking-search__button">Buscar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ranking-card">
                <div className="ranking-table-container table-responsive">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th style={{ width: '80px' }}>País</th>
                                <th className="text-start col-user">Usuario</th>
                                <th style={{ width: '120px' }}>Puntos totales</th>
                                {mode === 'global' && <th>Predicciones jugadas</th>}
                                {mode === 'global' && <th>Promedio por predicción</th>}
                                {mode === 'global' && <th>Aciertos totales</th>}
                                {mode === 'grand_prix' && <th className="text-start">Intervalo de Desempate (Gap)</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item) => {
                                const pos = item.globalRank;
                                const isTop3 = pos <= 3;
                                const posClass = isTop3 ? `pos-${pos}` : "";

                                const totalPoints = mode === 'global' ? (item.stats?.points?.total || 0) : item.points;
                                const totalPredictions = mode === 'global' ? (item.stats?.predictions?.total || 0) : item.predictionsCount;
                                const totalSuccesses = mode === 'global' ? (item.stats?.successes?.total || 0) : 0;
                                const avgPoints = totalPredictions > 0 ? (totalPoints / totalPredictions).toFixed(1) : "0.0";

                                return (
                                    <tr
                                        key={item._id || pos}
                                        id={item._id ? `user-row-${item._id}` : undefined}
                                        className={currentUserStat?._id === item._id ? 'is-current-user' : ''}
                                    >
                                        <td className={`pos-cell ${posClass}`}>{pos}</td>
                                        <td>
                                            <span className="emoji-flag" title={countriesMap[item.country] || item.country}>
                                                {getFlagEmoji(item.country)}
                                            </span>
                                        </td>
                                        <td className="text-start col-user">
                                            <div className="user-info">
                                                <span className="user-name">{item.name}</span>
                                                <span className="user-lastname">{item.last_name}</span>
                                            </div>
                                        </td>
                                        <td><strong>{totalPoints}</strong></td>
                                        {mode === 'global' && <td>{totalPredictions}</td>}
                                        {mode === 'global' && <td>{avgPoints}</td>}
                                        {mode === 'global' && <td>{totalSuccesses}</td>}
                                        {mode === 'grand_prix' && <td className="text-start">
                                            {item.gap ? item.gap : "-"}
                                        </td>}
                                    </tr>
                                );
                            })}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={mode === 'global' ? "7" : "5"} style={{ padding: '40px', color: '#666' }}>
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-end align-items-center mt-3 p-3">
                    <div className="pagination-controls d-flex gap-2 align-items-center">
                        <button
                            className="btn btn-sm btn-outline-light"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <i className="bi bi-chevron-left"></i> Anterior
                        </button>
                        <span className="text-light small">{page} / {totalPages || 1}</span>
                        <button
                            className="btn btn-sm btn-outline-light"
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage(page + 1)}
                        >
                            Siguiente <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Ranking;
