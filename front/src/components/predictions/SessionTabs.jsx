import cronometroIcon from "../../assets/icons/cronometro.svg";
import cruzIcon from "../../assets/icons/cruz.svg";

const SESSION_DEFS = [
    { id: 'sprint', label: 'SPRINT' },
    { id: 'qualifying', label: 'QUALY' },
    { id: 'race', label: 'RACE' }
];

export function getSessionButtonStatus(session) {
    if (!session) return "none";
    if (session.state === "Finalizado" || (session.results && session.results.length > 0)) return "finished";

    const now = new Date();
    const raceStart = new Date(session.date_race);

    if (session.state === "Pendiente" && now >= raceStart) return "pending_results";
    if (session.state === "Pendiente") return "upcoming";

    return "none";
}

/**
 * Tabs de sesión (sprint/qualy/race) reutilizados en PredictionHistory y en
 * el modal de comparación (FloatingPredictionCompare).
 */
function SessionTabs({ sessions = [], selectedSessionType, onSelect }) {
    return (
        <div className="session-tabs">
            {SESSION_DEFS.map(sessionDef => {
                const type = sessionDef.id;
                const session = sessions.find(s =>
                    s.type === type || (type === 'qualifying' && s.type === 'qualy')
                );
                const isSelected = selectedSessionType === type;
                const status = getSessionButtonStatus(session);
                const statusLabel = status === 'finished' ? 'PUNTOS' : (status === 'upcoming' ? 'PRÓXIMAMENTE' : (status === 'pending_results' ? 'EN CURSO' : 'NO APLICA'));
                const statusValue = status === 'finished' ? session.points : '';

                return (
                    <button
                        key={type}
                        className={`history-session-tab status-${status} ${isSelected ? 'is-selected' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (status === 'finished') onSelect(type);
                        }}
                        disabled={status !== 'finished'}
                    >
                        <span className="session-main">
                            <span className="session-type-name">{sessionDef.label}</span>
                            <span className="session-date">
                                {session ? new Date(session.date_race).toLocaleDateString('es-AR') : '-'}
                            </span>
                        </span>

                        <span className="session-status-block">
                            {status === 'finished' ? (
                                <>
                                    <span className="status-val">{statusValue}</span>
                                    <span className="status-lbl">{statusLabel}</span>
                                </>
                            ) : status === 'upcoming' ? (
                                <>
                                    <img src={cronometroIcon} alt="" className="status-icon" />
                                    <span className="status-lbl">{statusLabel}</span>
                                </>
                            ) : status === 'pending_results' ? (
                                <>
                                    <img src={cronometroIcon} alt="" className="status-icon pending-results" />
                                    <span className="status-lbl">{statusLabel}</span>
                                </>
                            ) : (
                                <>
                                    <img src={cruzIcon} alt="" className="status-icon" />
                                    <span className="status-lbl">{statusLabel}</span>
                                </>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default SessionTabs;
