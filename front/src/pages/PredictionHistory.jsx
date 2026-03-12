import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1200);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Bloquear scroll del body cuando el drawer está abierto en mobile
    useEffect(() => {
        if (isDrawerOpen && !isDesktop) {
            document.body.classList.add("body-scroll-lock");
        } else {
            document.body.classList.remove("body-scroll-lock");
        }

        // Limpieza al desmontar el componente
        return () => {
            document.body.classList.remove("body-scroll-lock");
        };
    }, [isDrawerOpen, isDesktop]);

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
        // Open drawer on mobile
        if (window.innerWidth < 1200) {
            setIsDrawerOpen(true);
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

    // Swipe to close functionality
    const handleDragEnd = (_, info) => {
        if (info.offset.y > 100) {
            setIsDrawerOpen(false);
        }
    };

    return (
        <section className="prediction-history-page page-section container">
            <header className="history-header text-center">
                <span className="section-label">Historial</span>
                <h1 className="section-title">PREDICCIONES</h1>
                <p className="section-subtitle">Esto fue lo que pensaste en los anteriores GP</p>
            </header>

            <div className="history-content">
                <div className="history-sidebar-wrapper">
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

                    <aside className="history-sidebar">
                        {filteredHistory.map((item) => {
                            const isSelected = selectedCircuitId === item.circuit._id;
                            const isFinished = item.sessions.every(s => s.state === "Finalizado");
                            const hasStarted = item.sessions.some(s => s.state !== "Pendiente");

                            return (
                                <div
                                    key={item.circuit._id}
                                    className={`history-circuit-card ${isSelected ? 'is-selected' : ''}`}
                                    onClick={() => handleCircuitClick(item.circuit._id)}
                                >
                                    <div className="history-card-info">
                                        <div className="history-card-top">
                                            <div className="history-card-location">
                                                <span className="emoji-flag me-2">{getFlagEmoji(item.circuit.country)}</span>
                                                <span className="history-gp-name">{item.circuit.gp_name}</span>
                                            </div>
                                        </div>
                                        <p className="history-card-circuit">{item.circuit.circuit_name}</p>
                                    </div>
                                    <div className={`history-card-date ${isFinished || hasStarted ? 'h-status-points' : 'h-status-upcoming'}`}>
                                        {isFinished || hasStarted ? (
                                            <>
                                                <span className="history-card-day">{item.totalPoints}</span>
                                                <span className="history-card-month history-desc">PTS</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="history-card-day">{new Date(item.date_gp_start).getDate()}</span>
                                                <span className="history-card-month history-desc">{new Date(item.date_gp_start).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </aside>
                </div>

                <AnimatePresence>
                    {isDrawerOpen && (
                        <>
                            <motion.div
                                className="history-drawer-overlay is-open"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDrawerOpen(false)}
                            />
                            <motion.main
                                className="history-detail is-open"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                drag="y"
                                dragConstraints={{ top: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                            >
                                {currentCircuit && (
                                    <>
                                        <div className="drawer-handle"></div>

                                        <div className="drawer-header-mobile">
                                            <span className="emoji-flag me-2">{getFlagEmoji(currentCircuit.circuit.country)}</span>
                                            <span className="history-gp-title">{currentCircuit.circuit.gp_name}</span>
                                        </div>

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
                                                const statusLabel = status === 'finished' ? 'PUNTOS' : (status === 'upcoming' ? 'PRÓXIMAMENTE' : 'NO APLICA');
                                                const statusValue = status === 'finished' ? session.points : '';

                                                return (
                                                    <button
                                                        key={type}
                                                        className={`history-session-tab status-${status} ${isSelected ? 'is-selected' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (status === 'finished') setSelectedSessionType(type);
                                                        }}
                                                        disabled={status !== 'finished'}
                                                    >
                                                        <div className="session-main">
                                                            <span className="session-type-name">{sessionDef.label}</span>
                                                            <span className="session-date">
                                                                {session ? new Date(session.date_race).toLocaleDateString('es-AR') : '-'}
                                                            </span>
                                                        </div>

                                                        <div className="session-status-block">
                                                            {status === 'finished' ? (
                                                                <>
                                                                    <span className="status-val">{statusValue}</span>
                                                                    <span className="status-lbl">{statusLabel}</span>
                                                                </>
                                                            ) : status === 'upcoming' ? (
                                                                <>
                                                                    <img src={cronometroIcon} alt="Icon" className="status-icon" />
                                                                    <span className="status-lbl">{statusLabel}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <img src={cruzIcon} alt="Icon" className="status-icon" />
                                                                    <span className="status-lbl">{statusLabel}</span>
                                                                </>
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
                                )}
                            </motion.main>
                        </>
                    )}
                </AnimatePresence>

                {/* Desktop Detail View (non-mobile) */}
                {!isDrawerOpen && isDesktop && (
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
                                        const statusLabel = status === 'finished' ? 'PUNTOS' : (status === 'upcoming' ? 'PRÓXIMAMENTE' : 'NO APLICA');
                                        const statusValue = status === 'finished' ? session.points : '';

                                        return (
                                            <button
                                                key={type}
                                                className={`history-session-tab status-${status} ${isSelected ? 'is-selected' : ''}`}
                                                onClick={() => {
                                                    if (status === 'finished') setSelectedSessionType(type);
                                                }}
                                                disabled={status !== 'finished'}
                                            >
                                                <div className="session-main">
                                                    <span className="session-type-name">{sessionDef.label}</span>
                                                    <span className="session-date">
                                                        {session ? new Date(session.date_race).toLocaleDateString('es-AR') : '-'}
                                                    </span>
                                                </div>

                                                <div className="session-status-block">
                                                    {status === 'finished' ? (
                                                        <>
                                                            <span className="status-val">{statusValue}</span>
                                                            <span className="status-lbl">{statusLabel}</span>
                                                        </>
                                                    ) : status === 'upcoming' ? (
                                                        <>
                                                            <img src={cronometroIcon} alt="Icon" className="status-icon" />
                                                            <span className="status-lbl">{statusLabel}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <img src={cruzIcon} alt="Icon" className="status-icon" />
                                                            <span className="status-lbl">{statusLabel}</span>
                                                        </>
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
                )}
            </div>
        </section>
    );
}

export default PredictionHistory;
