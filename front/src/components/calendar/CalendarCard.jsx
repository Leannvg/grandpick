import { useState } from "react";
import { DateTime } from "luxon";
import { getFlagEmoji } from "../../utils/helpers";
import { buildSchedule } from "../../utils/schedule";
import ScheduleGroups from "./ScheduleGroups";
import "../../assets/styles/calendar.css";

const STATUS = {
    finished: { label: "Finalizado", icon: "bi-check2" },
    current: { label: "En curso", icon: "bi-broadcast" },
    next: { label: "Próximo", icon: "bi-hourglass-split" },
    upcoming: { label: "Próximo", icon: "bi-hourglass-split" },
};

function CalendarCard({ race, roundNumber, status, dayLabel, monthLabel, practices = [], predictionsByRaceId = {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const [zoneMode, setZoneMode] = useState("mine");

    const circuitZone = race.circuit?.timezone || "UTC";
    const circuitId = race.circuit?._id;
    const sessions = [...race.sessions].sort(
        (a, b) => DateTime.fromISO(a.date_race).toMillis() - DateTime.fromISO(b.date_race).toMillis()
    );
    const groups = buildSchedule(sessions, practices);
    const hasSprint = race.sessionTypes.includes("sprint");
    const statusInfo = STATUS[status];
    const panelId = `cal-panel-${race._id}`;

    return (
        <article className={`cal-card ${isOpen ? "is-open" : ""}`}>
            <div className="cal-card__row" onClick={() => setIsOpen((v) => !v)}>
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
                    aria-label={isOpen ? "Ocultar horarios" : "Mostrar horarios"}
                >
                    <i className="bi bi-chevron-down cal-card__chevron"></i>
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
                        <ScheduleGroups
                            groups={groups}
                            zoneMode={zoneMode}
                            setZoneMode={setZoneMode}
                            circuitZone={circuitZone}
                            circuitId={circuitId}
                            predictionsByRaceId={predictionsByRaceId}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}

export default CalendarCard;
