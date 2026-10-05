import { useState } from "react";
import { DateTime } from "luxon";
import { getFlagEmoji } from "../../utils/helpers";
import "../../assets/styles/calendar.css";

const DOW = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const SESSION_LABEL = { race: "Carrera", sprint: "Sprint", qualy: "Clasificación" };
const STATUS = {
    finished: { label: "Finalizado", icon: "bi-check2" },
    current: { label: "En curso", icon: "bi-broadcast" },
    upcoming: { label: "Próximo", icon: "bi-hourglass-split" },
};

function formatSessionTime(iso, zone) {
    const dt = DateTime.fromISO(iso).setZone(zone);
    return {
        dow: DOW[dt.weekday % 7],
        day: String(dt.day).padStart(2, "0"),
        time: dt.toFormat("HH:mm"),
    };
}

function CalendarCard({ race, roundNumber, status, dayLabel, monthLabel }) {
    const [isOpen, setIsOpen] = useState(false);
    const [zoneMode, setZoneMode] = useState("mine");

    const circuitZone = race.circuit?.timezone || "UTC";
    const sessions = [...race.sessions].sort(
        (a, b) => DateTime.fromISO(a.date_race).toMillis() - DateTime.fromISO(b.date_race).toMillis()
    );
    const hasSprint = race.sessionTypes.includes("sprint");
    const statusInfo = STATUS[status];
    const panelId = `cal-panel-${race._id}`;

    return (
        <article className={`cal-card ${isOpen ? "is-open" : ""}`}>
            <div className="cal-card__row">
                <div className="cal-card__rail">
                    <span className="cal-card__ord">{roundNumber}<sup>º</sup></span>
                </div>

                <div className="cal-card__info">
                    <div className="cal-card__top">
                        <div className="cal-card__loc">
                            <span className="emoji-flag">{getFlagEmoji(race.circuit?.country)}</span>
                            <span className="cal-card__country">{race.circuit.country_name || race.circuit.country}</span>
                        </div>
                        {hasSprint && <span className="cal-card__sprint">SPRINT</span>}
                    </div>
                    <p className="cal-card__circuit">{race.circuit.circuit_name}</p>
                </div>

                <button
                    type="button"
                    className="cal-card__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={isOpen ? "Cerrar horarios" : "Ver horarios"}
                    onClick={() => setIsOpen((v) => !v)}
                >
                    <span className="cal-card__ico cal-card__ico--clock"><i className="bi bi-clock"></i></span>
                    <span className="cal-card__ico cal-card__ico--close"><i className="bi bi-x-lg"></i></span>
                </button>

                <div className={`cal-card__date is-${status}`}>
                    <span className="cal-card__day">{dayLabel}</span>
                    <span className="cal-card__month">{monthLabel}</span>
                    <span className="cal-card__status">
                        <i className={`bi ${statusInfo.icon}`}></i>
                        {statusInfo.label}
                    </span>
                </div>
            </div>

            <div className="cal-card__panel-wrap" id={panelId}>
                <div className="cal-card__panel">
                    <div className="cal-card__panel-inner">
                        <div className="cal-zone" role="group" aria-label="Zona horaria">
                            <button
                                type="button"
                                className={zoneMode === "mine" ? "is-active" : ""}
                                onClick={() => setZoneMode("mine")}
                            >
                                <i className="bi bi-person-fill"></i>Mi tiempo
                            </button>
                            <button
                                type="button"
                                className={zoneMode === "circuit" ? "is-active" : ""}
                                onClick={() => setZoneMode("circuit")}
                            >
                                <i className="bi bi-geo-alt-fill"></i>Tiempo de circuito
                            </button>
                        </div>

                        {sessions.map((s, i) => {
                            const type = s.points_system?.type;
                            const t = formatSessionTime(s.date_race, zoneMode === "mine" ? "local" : circuitZone);
                            return (
                                <div className="cal-session" key={s._id} style={{ "--i": i }}>
                                    <div className="cal-session__date">
                                        <span className="cal-session__dow">{t.dow}</span>
                                        <span className="cal-session__dnum">{t.day}</span>
                                    </div>
                                    <span className="cal-session__sep" aria-hidden="true"></span>
                                    <div className="cal-session__main">
                                        <span className="cal-session__name">{SESSION_LABEL[type] || type}</span>
                                        <span className="cal-session__time">
                                            <i className="bi bi-clock"></i>{t.time}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default CalendarCard;
