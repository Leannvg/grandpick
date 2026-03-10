import { useEffect, useState, useMemo } from "react";
import PredictionServices from "../services/predictions.services";
import UsersServices from "../services/users.services";
import { useLoader } from "../context/LoaderContext";
import { getFlagEmoji } from "../utils/helpers";
import calendarioIcon from "../assets/icons/calendario.svg";
import cronometroIcon from "../assets/icons/cronometro.svg";
import cruzIcon from "../assets/icons/cruz.svg";
import "../assets/styles/predictionHistory.css";

function PredictionHistory() {
    const [history, setHistory] = useState([]);
    const [selectedCircuitId, setSelectedCircuitId] = useState(null);
    const [selectedSessionType, setSelectedSessionType] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState("");
    const [user, setUser] = useState(null);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadData() {
            showLoader();
            try {
                const userData = await UsersServices.getUserProfile();
                setUser(userData);
                const historyData = await PredictionServices.findHistoryByUser(userData._id, year);
                setHistory(historyData);
                if (historyData.length > 0) {
                    setSelectedCircuitId(historyData[0].circuit._id);
                    // Find first available session with results or prediction
                    const firstCircuit = historyData[0];
                    const firstSession = firstCircuit.sessions.find(s => s.results?.length > 0 || s.prediction) || firstCircuit.sessions[0];
                    setSelectedSessionType(firstSession?.type || "race");
                }
            } catch (err) {
                console.error("Error loading history:", err);
            } finally {
                hideLoader();
            }
        }
        loadData();
    }, [year]);

    const filteredHistory = useMemo(() => {
        return history.filter(item =>
            item.circuit.gp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.circuit.circuit_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [history, searchTerm]);

    const currentCircuit = useMemo(() => {
        return history.find(h => h.circuit._id === selectedCircuitId);
    }, [history, selectedCircuitId]);

    const currentSession = useMemo(() => {
        if (!currentCircuit) return null;
        return currentCircuit.sessions.find(s => s.type === selectedSessionType);
    }, [currentCircuit, selectedSessionType]);

    const handleCircuitClick = (circuitId) => {
        setSelectedCircuitId(circuitId);
        const circuit = history.find(h => h.circuit._id === circuitId);
        if (circuit) {
            // Pick a reasonable default session for the selected circuit
            const bestSession = circuit.sessions.find(s => s.results?.length > 0 || s.prediction) || circuit.sessions[0];
            setSelectedSessionType(bestSession?.type || "race");
        }
    };

    const getSessionButtonStatus = (session, allSessions) => {
        if (!session) return "none";
        if (session.state === "Finalizado" || (session.results && session.results.length > 0)) return "finished";

        // Find the next session among those pending
        const upcomingSession = allSessions
            .filter(s => s.state === "Pendiente")
            .sort((a, b) => new Date(a.date_race) - new Date(b.date_race))[0];

        if (upcomingSession && upcomingSession.type === session.type) {
            return "upcoming";
        }

        return "pending";
    };

    const renderPoints = (session) => {
        if (!session || session.points === undefined) return null;
        return (
            <div className="session-points-badge">
                <span className="points-value">{session.points}</span>
                <span className="points-label">PUNTOS</span>
            </div>
        );
    };

    return (
        <section className="prediction-history-page page-section container">
            <header className="history-header text-center">
                <span className="section-label">Historial</span>
                <h1 className="section-title">PREDICCIONES</h1>
                <p className="section-subtitle">Esto fue lo que pensaste en los anteriores GP</p>
            </header>

            <div className="history-filters">
                <div className="year-selector">
                    <span className="year-display">{year}</span>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscador"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-search">Buscar</button>
                </div>
            </div>

            <div className="history-content">
                {/* Sidebar */}
                <aside className="history-sidebar">
                    {filteredHistory.map((item) => {
                        const isSelected = selectedCircuitId === item.circuit._id;
                        const isFinished = item.sessions.every(s => s.state === "Finalizado");
                        const hasStarted = item.sessions.some(s => s.state !== "Pendiente");

                        return (
                            <div
                                key={item.circuit._id}
                                className={`calendar-item history-circuit-card ${isSelected ? 'is-selected' : ''}`}
                                onClick={() => handleCircuitClick(item.circuit._id)}
                            >
                                <div className="race-info">
                                    <div className="race-top">
                                        <div className="race-location">
                                            <span className="emoji-flag me-2">{getFlagEmoji(item.circuit.country)}</span>
                                            <span className="circuit-gp">{item.circuit.gp_name}</span>
                                        </div>
                                    </div>
                                    <p className="race-circuit">{item.circuit.circuit_name}</p>
                                </div>
                                <div className={`race-date ${isFinished || hasStarted ? 'status-points' : 'race-upcoming'}`}>
                                    {isFinished || hasStarted ? (
                                        <>
                                            <span className="race-day">{item.totalPoints}</span>
                                            <span className="race-month     race-description">PTS</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="race-day">{new Date(item.date_gp_start).getDate()}</span>
                                            <span className="race-month race-description">{new Date(item.date_gp_start).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase()}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </aside>

                {/* Main View */}
                <main className="history-detail">
                    {currentCircuit ? (
                        <>
                            <div className="session-tabs">
                                {[
                                    { id: 'sprint', label: 'SPRINT' },
                                    { id: 'qualifying', label: 'QUALY' },
                                    { id: 'race', label: 'RACE' }
                                ].map(sessionDef => {
                                    const type = sessionDef.id;
                                    const session = currentCircuit.sessions.find(s => s.type === type);
                                    const isSelected = selectedSessionType === type;
                                    const status = getSessionButtonStatus(session, currentCircuit.sessions);

                                    return (
                                        <button
                                            key={type}
                                            className={`calendar-item session-tab ${isSelected ? 'is-selected' : ''}`}
                                            onClick={() => (status === 'finished') && setSelectedSessionType(type)}
                                            disabled={status !== 'finished'}
                                        >
                                            <div className="race-info">
                                                <div className="race-top">
                                                    <span className="circuit-gp" style={{ fontSize: '1.2rem' }}>{sessionDef.label}</span>
                                                </div>
                                                <p className="race-circuit">{session ? new Date(session.date_race).toLocaleDateString('es-AR') : '-'}</p>
                                            </div>

                                            <div className={`race-date ${status === 'finished' ? 'status-points' : (status === 'upcoming' ? 'status-upcoming' : 'status-na')}`} style={{ minWidth: '80px' }}>
                                                {status === 'finished' ? (
                                                    <>
                                                        <span className="race-day">{session.points}</span>
                                                        <span className="race-month race-description">PTS</span>
                                                    </>
                                                ) : status === 'upcoming' ? (
                                                    <img src={cronometroIcon} alt="Upcoming" style={{ width: '22px', filter: 'brightness(0) invert(1)' }} />
                                                ) : (
                                                    <img src={cruzIcon} alt="N/A" style={{ width: '18px', filter: 'brightness(0) invert(1)' }} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="prediction-comparison-table">
                                <div className="table-header">
                                    <div className="col-pos">Pos</div>
                                    <div className="col-pred">Tu predicción</div>
                                    <div className="col-real">Resultado real</div>
                                    <div className="col-points">Puntos</div>
                                </div>
                                <div className="table-body">
                                    {Array.from({ length: currentSession?.points_system?.points?.length || 10 }).map((_, idx) => {
                                        const pos = idx + 1;
                                        const pred = currentSession?.prediction?.find(p => p.position === pos);
                                        const real = currentSession?.results?.find(r => r.position === pos);
                                        const isMatch = pred && real && pred.driver._id === real.driver._id;
                                        const points = isMatch ? currentSession.points_system.points[idx] : 0;

                                        return (
                                            <div key={pos} className={`table-row ${pred && !isMatch && real ? 'no-match' : ''}`}>
                                                <div className="col-pos">{pos}</div>
                                                <div className="col-pred">
                                                    {pred ? (
                                                        <>
                                                            <div className="driver-color-bar" style={{ backgroundColor: pred.driver.team_info?.color || '#ccc' }}></div>
                                                            <span className="driver-name">{pred.driver.full_name.split(' ')[0]} <strong>{pred.driver.full_name.split(' ').slice(1).join(' ')}</strong></span>
                                                        </>
                                                    ) : '-'}
                                                </div>
                                                <div className="col-real">
                                                    {real ? (
                                                        <>
                                                            <div className="driver-color-bar" style={{ backgroundColor: real.driver.team_info?.color || '#ccc' }}></div>
                                                            <span className="driver-name">{real.driver.full_name.split(' ')[0]} <strong>{real.driver.full_name.split(' ').slice(1).join(' ')}</strong></span>
                                                        </>
                                                    ) : '-'}
                                                </div>
                                                <div className={`col-points ${isMatch ? 'match' : (pred && real ? 'mismatch' : '')}`}>
                                                    {isMatch ? points : (pred && real ? 0 : '-')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-selection-message">
                            Selecciona un circuito para ver el historial
                        </div>
                    )}
                </main>
            </div>
        </section>
    );
}

export default PredictionHistory;
