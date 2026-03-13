import { useEffect, useState, useMemo } from "react";
import { useLoader } from "../context/LoaderContext";
import UsersServices from "../services/users.services";
import { getFlagEmoji } from "../utils/helpers";
import { usePagination } from "../hooks/usePagination";
import "../assets/styles/ranking.css";

function Ranking() {
    const [stats, setStats] = useState([]);
    const [currentUserStat, setCurrentUserStat] = useState(null);
    const { showLoader, hideLoader } = useLoader();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            showLoader();
            try {
                const data = await UsersServices.getAllUsersStats();
                // ... sorting logic ...
                const sortedData = [...data].sort((a, b) => {
                    const pointsA = a.stats?.points?.total || 0;
                    const pointsB = b.stats?.points?.total || 0;
                    if (pointsB !== pointsA) return pointsB - pointsA;

                    const successesA = a.stats?.successes?.total || 0;
                    const successesB = b.stats?.successes?.total || 0;
                    if (successesB !== successesA) return successesB - successesA;

                    const avgA = a.stats?.predictions?.total > 0 ? pointsA / a.stats.predictions.total : 0;
                    const avgB = b.stats?.predictions?.total > 0 ? pointsB / b.stats.predictions.total : 0;
                    return avgB - avgA;
                }).map((item, index) => ({
                    ...item,
                    globalRank: index + 1
                }));

                setStats(sortedData);
                
                // Buscar la posición del usuario logueado
                const profile = await UsersServices.getUserProfile();
                if (profile) {
                    const userFound = sortedData.find(u => u._id === profile._id);
                    if (userFound) {
                        setCurrentUserStat(userFound);
                    }
                }
            } catch (error) {
                console.error("Error al cargar el ranking:", error);
            } finally {
                hideLoader();
            }
        };

        fetchStats();
    }, []);

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
        <section className="ranking-page page-section container text-center">
            <header className="page-header">
                <p className="section-label">Todos quieren subirse al podio</p>
                <h1 className="section-title">PUNTUACIÓN GLOBAL</h1>
                <p className="section-subtitle">Campeonato de predicciones</p>
            </header>

            <div className="ranking-filters">
                <div className="ranking-filters__left">
                    <select className="ranking-filters__year">
                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                    </select>

                    <div className="d-flex align-items-center ms-3">
                        <label className="me-2 text-light small">Mostrar:</label>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="form-select form-select-sm bg-dark text-light border-secondary"
                            style={{ width: "80px" }}
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

                <div className="ranking-search">
                    <input
                        type="text"
                        placeholder="Buscador"
                        className="ranking-search__input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="ranking-search__button">Buscar</button>
                </div>
            </div>

            <div className="ranking-card">
                <div className="ranking-table-container table-responsive">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th>Usuario</th>
                                <th>País</th>
                                <th>Puntos totales</th>
                                <th>Predicciones jugadas</th>
                                <th>Promedio por predicción</th>
                                <th>Aciertos totales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Fila del usuario logueado destacada */}
                            {currentUserStat && !searchTerm && (
                                <tr className="ranking-table__user-row shadow-sm">
                                    <td className={`pos-cell ${currentUserStat.globalRank <= 3 ? `pos-${currentUserStat.globalRank}` : ""}`}>
                                        {currentUserStat.globalRank}
                                    </td>
                                    <td>
                                        <div className="user-info">
                                            <span className="user-name">{currentUserStat.name}</span>
                                            <span className="user-lastname">{currentUserStat.last_name}</span>
                                            <span className="badge bg-primary ms-2" style={{ fontSize: '10px' }}>TU POSICIÓN</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="emoji-flag" title={currentUserStat.country}>
                                            {getFlagEmoji(currentUserStat.country)}
                                        </span>
                                    </td>
                                    <td><strong>{currentUserStat.stats?.points?.total || 0}</strong></td>
                                    <td>{currentUserStat.stats?.predictions?.total || 0}</td>
                                    <td>{currentUserStat.stats?.predictions?.total > 0 ? (currentUserStat.stats.points.total / currentUserStat.stats.predictions.total).toFixed(1) : "0.0"}</td>
                                    <td>{currentUserStat.stats?.successes?.total || 0}</td>
                                </tr>
                            )}
                            
                            {/* Espaciador si hay fila de usuario */}
                            {currentUserStat && !searchTerm && (
                                <tr className="ranking-table__spacer">
                                    <td colSpan="7"></td>
                                </tr>
                            )}
                            {paginatedData.map((item) => {
                                const pos = item.globalRank;
                                const isTop3 = pos <= 3;
                                const posClass = isTop3 ? `pos-${pos}` : "";

                                const totalPoints = item.stats?.points?.total || 0;
                                const totalPredictions = item.stats?.predictions?.total || 0;
                                const totalSuccesses = item.stats?.successes?.total || 0;
                                const avgPoints = totalPredictions > 0 ? (totalPoints / totalPredictions).toFixed(1) : "0.0";

                                return (
                                    <tr key={item._id || pos}>
                                        <td className={`pos-cell ${posClass}`}>{pos}</td>
                                        <td>
                                            <div className="user-info">
                                                <span className="user-name">{item.name}</span>
                                                <span className="user-lastname">{item.last_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="emoji-flag" title={item.country}>
                                                {getFlagEmoji(item.country)}
                                            </span>
                                        </td>
                                        <td><strong>{totalPoints}</strong></td>
                                        <td>{totalPredictions}</td>
                                        <td>{avgPoints}</td>
                                        <td>{totalSuccesses}</td>
                                    </tr>
                                );
                            })}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', color: '#666' }}>
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINACIÓN INFERIOR */}
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
