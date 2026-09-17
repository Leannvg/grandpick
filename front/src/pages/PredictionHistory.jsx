import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PredictionServices from "../services/predictions.services";
import UsersServices from "../services/users.services";
import { useLoader } from "../context/LoaderContext";
import { getFlagEmoji } from "../utils/helpers";
import SessionTabs from "../components/predictions/SessionTabs";
import PredictionComparisonTable from "../components/predictions/PredictionComparisonTable";
import BackButton from "../components/BackButton";
import "../assets/styles/predictionHistory.css";

function PredictionHistory() {
    const { userId: routeUserId } = useParams();
    const location = useLocation();
    const [history, setHistory] = useState([]);
    const [selectedCircuitId, setSelectedCircuitId] = useState(null);
    const [selectedSessionType, setSelectedSessionType] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState("");
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);
    const { showLoader, hideLoader } = useLoader();

    const isOwnHistory = !routeUserId;
    const otherUserName = userStats
        ? `${userStats.name} ${userStats.last_name || ''}`.trim()
        : (location.state?.name ? `${location.state.name} ${location.state.last_name || ''}`.trim() : null);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1200);
        const handleCloseDrawers = () => setIsDrawerOpen(false);

        window.addEventListener('resize', handleResize);
        window.addEventListener('close-all-drawers', handleCloseDrawers);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('close-all-drawers', handleCloseDrawers);
        };
    }, []);

    useEffect(() => {
        if (isDrawerOpen && !isDesktop) {
            document.body.classList.add("body-scroll-lock");
        } else {
            document.body.classList.remove("body-scroll-lock");
        }
        return () => {
            document.body.classList.remove("body-scroll-lock");
        };
    }, [isDrawerOpen, isDesktop]);

    useEffect(() => {
        async function loadData() {
            showLoader();
            setUserStats(null);
            try {
                const userData = await UsersServices.getUserProfile();
                setUser(userData);
                const targetUserId = routeUserId || userData._id;
                const historyData = await PredictionServices.findHistoryByUser(targetUserId, year);
                setHistory(historyData);

                if (routeUserId) {
                    UsersServices.getUserStats(targetUserId)
                        .then(setUserStats)
                        .catch(err => console.error("Error loading user stats:", err));
                }

                if (historyData.length > 0) {
                    setSelectedCircuitId(historyData[0].circuit._id);
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
    }, [year, routeUserId]);

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
            // Elegir una sesión por defecto razonable para el circuito seleccionado
            const bestSession = circuit.sessions.find(s => s.results?.length > 0 || s.prediction) || circuit.sessions[0];
            setSelectedSessionType(bestSession?.type || "race");
        }
        // Abrir drawer en celular
        if (window.innerWidth < 1200) {
            setIsDrawerOpen(true);
        }
    };

    // Funcionalidad de deslizar para cerrar
    const handleDragEnd = (_, info) => {
        if (info.offset.y > 100) {
            setIsDrawerOpen(false);
        }
    };

    return (
        <div className="prediction-history-page page-wrapper">
            <section className="page-section container">
                {!isOwnHistory && <BackButton to="/ranking" text="Volver al ranking" />}
                <header className="page-header text-center">
                    <span className="section-label">{isOwnHistory ? "Mi Historial" : "Historial"}</span>
                    <h1 className="section-title">PREDICCIONES</h1>
                    <p className="section-subtitle">
                        {isOwnHistory
                            ? "Esto fue lo que pensaste en los anteriores GP"
                            : `Así fueron las predicciones de ${otherUserName || "este usuario"} en los anteriores GP`}
                    </p>
                </header>

                {!isOwnHistory && userStats && (
                    <div className="history-user-summary">
                        <div className="history-summary-item">
                            <span className="history-summary-label">Usuario</span>
                            <span className="history-summary-value">{userStats.name} {userStats.last_name}</span>
                        </div>
                        <div className="history-summary-item">
                            <span className="history-summary-label">Predicciones totales</span>
                            <span className="history-summary-value">{userStats.stats?.predictions?.total || 0}</span>
                        </div>
                        <div className="history-summary-item">
                            <span className="history-summary-label">Aciertos</span>
                            <span className="history-summary-value">{userStats.stats?.successes?.total || 0}</span>
                        </div>
                        <div className="history-summary-item">
                            <span className="history-summary-label">Puntos totales</span>
                            <span className="history-summary-value">{userStats.stats?.points?.total || 0}</span>
                        </div>
                    </div>
                )}

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
                                            <div className="drawer-header-mobile">
                                                <div className="drawer-handle"></div>
                                                <div className="history-gp-title">
                                                    <span className="emoji-flag me-2">{getFlagEmoji(currentCircuit.circuit.country)}</span>
                                                    {currentCircuit.circuit.gp_name}
                                                </div>
                                            </div>

                                            <SessionTabs
                                                sessions={currentCircuit.sessions}
                                                selectedSessionType={selectedSessionType}
                                                onSelect={setSelectedSessionType}
                                            />

                                            <PredictionComparisonTable session={currentSession} />
                                        </>
                                    )}
                                </motion.main>
                            </>
                        )}
                    </AnimatePresence>


                    {!isDrawerOpen && isDesktop && (
                        <div className="history-detail">
                            {currentCircuit ? (
                                <>
                                    <SessionTabs
                                        sessions={currentCircuit.sessions}
                                        selectedSessionType={selectedSessionType}
                                        onSelect={setSelectedSessionType}
                                    />

                                    <PredictionComparisonTable session={currentSession} />
                                </>
                            ) : (
                                <div className="no-selection-message">
                                    Selecciona un circuito para ver tu historial
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default PredictionHistory;
