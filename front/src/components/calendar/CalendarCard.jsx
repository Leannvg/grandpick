import { useState } from "react";
import { DateTime } from "luxon";
import { getFlagEmoji } from "../../utils/helpers";
import "../../assets/styles/calendar.css";

const DOW = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
// Duraciones genéricas por tipo de sesión (la base todavía no las guarda)
const DURATION = { practice: "60 MIN.", qualyMain: "60 MIN.", qualySprint: "45 MIN.", sprint: "35 MIN.", race: "2 HS." };

// Arma los grupos del panel a partir de las sesiones de Races.
// En fin de semana sprint, la clasificación anterior al sprint es "Clasificación sprint".
function buildSchedule(sessions) {
    const hasSprint = sessions.some((s) => s.points_system?.type === "sprint");
    const sprintMillis = hasSprint
        ? DateTime.fromISO(sessions.find((s) => s.points_system?.type === "sprint").date_race).toMillis()
        : null;

    const items = sessions.map((s) => {
        const type = s.points_system?.type;
        const millis = DateTime.fromISO(s.date_race).toMillis();
        if (type === "sprint") return { id: s._id, iso: s.date_race, group: "sprint", label: "Sprint", dur: DURATION.sprint, race: false };
        if (type === "qualy" && hasSprint && millis < sprintMillis)
            return { id: s._id, iso: s.date_race, group: "sprint", label: "Clasificación sprint", dur: DURATION.qualySprint, race: false };
        if (type === "qualy") return { id: s._id, iso: s.date_race, group: "main", label: "Clasificación", dur: DURATION.qualyMain, race: false };
        return { id: s._id, iso: s.date_race, group: "main", label: "Carrera", dur: DURATION.race, race: true };
    });

    const groups = [];
    if (hasSprint) groups.push({ key: "sprint", title: "Fin de semana sprint", icon: "bi-lightning-charge-fill", items: items.filter((i) => i.group === "sprint") });
    groups.push({ key: "main", title: "Clasificación y carrera", icon: "bi-flag-fill", items: items.filter((i) => i.group === "main") });
    return groups.filter((g) => g.items.length > 0);
}
const STATUS = {
    finished: { label: "Finalizado", icon: "bi-check2" },
    current: { label: "En curso", icon: "bi-broadcast" },
    next: { label: "Próximo", icon: "bi-hourglass-split" },
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
    const groups = buildSchedule(sessions);
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

                        {groups.map((g, gi) => (
                            <div className="cal-card__group" key={g.key}>
                                <div className="cal-card__group-title" style={{ "--i": gi * 3 }}>
                                    <i className={`bi ${g.icon}`}></i>{g.title}
                                </div>
                                {g.items.map((it, i) => {
                                    const t = formatSessionTime(it.iso, zoneMode === "mine" ? "local" : circuitZone);
                                    return (
                                        <div className="cal-session" key={it.id} style={{ "--i": gi * 3 + i + 1 }}>
                                            <div className="cal-session__date">
                                                <span className="cal-session__dow">{t.dow}</span>
                                                <span className="cal-session__dnum">{t.day}</span>
                                            </div>
                                            <span className="cal-session__sep" aria-hidden="true"></span>
                                            <div className="cal-session__main">
                                                <span className="cal-session__name">{it.label}</span>
                                                <span className="cal-session__time">
                                                    <i className="bi bi-clock"></i>{t.time}
                                                </span>
                                            </div>
                                            <span className={`cal-session__dur ${it.race ? "is-race" : it.label === "Sprint" ? "is-sprint" : ""}`}>{it.dur}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default CalendarCard;
