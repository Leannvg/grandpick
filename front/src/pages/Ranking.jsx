import { useEffect, useState } from "react";
import UsersServices from "../services/users.services";
import "../assets/styles/ranking.css";

function Ranking() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await UsersServices.getAllUsersStats();

                // Ordenar siguiendo las reglas:
                // 1. Puntos totales (descendente)
                // 2. Aciertos totales (descendente)
                // 3. Promedio de puntos por predicción (descendente)
                const sortedData = [...data].sort((a, b) => {
                    // Criterio 1: Puntos totales
                    const pointsA = a.stats?.points?.total || 0;
                    const pointsB = b.stats?.points?.total || 0;
                    if (pointsB !== pointsA) return pointsB - pointsA;

                    // Criterio 2: Aciertos totales
                    const successesA = a.stats?.successes?.total || 0;
                    const successesB = b.stats?.successes?.total || 0;
                    if (successesB !== successesA) return successesB - successesA;

                    // Criterio 3: Promedio de puntos por predicción
                    const avgA = a.stats?.predictions?.total > 0 ? pointsA / a.stats.predictions.total : 0;
                    const avgB = b.stats?.predictions?.total > 0 ? pointsB / b.stats.predictions.total : 0;
                    return avgB - avgA;
                });

                setStats(sortedData);
            } catch (error) {
                console.error("Error al cargar el ranking:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const filteredStats = stats.filter(userStat => {
        const fullName = `${userStat.name} ${userStat.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Cargando ranking...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="ranking-page">
            <header className="ranking-page__header">
                <p className="ranking-page__eyebrow">Todos quieren subirse al podio</p>
                <h1 className="ranking-page__title">PUNTUACIÓN GLOBAL</h1>
                <p className="ranking-page__subtitle">Campeonato de predicciones</p>
            </header>

            <div className="ranking-filters">
                <select className="ranking-filters__year">
                    <option value="2025">2025</option>
                </select>

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
                <div className="ranking-table-container">
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
                            {filteredStats.map((item, index) => {
                                const pos = index + 1;
                                const isTop3 = pos <= 3;
                                const posClass = isTop3 ? `pos-${pos}` : "";

                                const totalPoints = item.stats?.points?.total || 0;
                                const totalPredictions = item.stats?.predictions?.total || 0;
                                const totalSuccesses = item.stats?.successes?.total || 0;
                                const avgPoints = totalPredictions > 0 ? (totalPoints / totalPredictions).toFixed(1) : "0.0";

                                return (
                                    <tr key={item._id || index}>
                                        <td className={`pos-cell ${posClass}`}>{pos}</td>
                                        <td>
                                            <div className="user-info">
                                                <span className="user-name">{item.name}</span>
                                                <span className="user-lastname">{item.last_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="country-flag">{item.country}</span>
                                        </td>
                                        <td><strong>{totalPoints}</strong></td>
                                        <td>{totalPredictions}</td>
                                        <td>{avgPoints}</td>
                                        <td>{totalSuccesses}</td>
                                    </tr>
                                );
                            })}
                            {filteredStats.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', color: '#666' }}>
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Ranking;
