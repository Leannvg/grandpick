import { useEffect, useState } from "react";
import racesServices from "../services/races.services";
import { useLoader } from "../context/LoaderContext";
import { getFlagEmoji } from "../utils/helpers";

function Calendar() {
    const [races, setRaces] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        async function loadRaces() {
            showLoader();
            try {
                const currentYear = new Date().getFullYear();
                const data = await racesServices.findAllByYear(currentYear);

                // Group races by circuit and weekend
                const groupedMap = new Map();
                data.forEach(race => {
                    const key = `${race.id_circuit}_${race.date_gp_start}`;
                    if (!groupedMap.has(key)) {
                        groupedMap.set(key, {
                            ...race,
                            sessionTypes: [race.points_system.type]
                        });
                    } else {
                        const existing = groupedMap.get(key);
                        if (!existing.sessionTypes.includes(race.points_system.type)) {
                            existing.sessionTypes.push(race.points_system.type);
                        }
                        // Update state: if any session is NOT finished, keep it as NOT finished
                        if (existing.state === "Finalizado" && race.state !== "Finalizado") {
                            existing.state = race.state;
                        }
                    }
                });

                const sortedData = Array.from(groupedMap.values()).sort((a, b) => new Date(a.date_gp_start) - new Date(b.date_gp_start));

                const now = new Date().getTime();
                const index = sortedData.findIndex(race =>
                    race.state !== "Finalizado" && new Date(race.date_gp_end).getTime() >= now
                );
                setCurrentIndex(index);
                setRaces(sortedData);
            } catch (error) {
                console.error("Error al obtener las carreras:", error);
            } finally {
                hideLoader();
            }
        }

        loadRaces();
    }, []);

    function getStatusClass(index) {
        if (currentIndex === -1) return "race-finished"; // Todas terminaron o lista vacía
        if (index < currentIndex) return "race-finished";
        if (index === currentIndex) return "race-current";
        return "race-upcoming";
    }

    function formatDayRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dayStart = start.getUTCDate();
        const dayEnd = end.getUTCDate();

        if (dayStart === dayEnd) return `${dayStart}`;
        return `${dayStart}–${dayEnd}`;
    }

    function formatMonthShort(startDate, endDate) {
        const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startMonth = months[start.getUTCMonth()];
        const endMonth = months[end.getUTCMonth()];

        if (startMonth === endMonth) return startMonth;
        return `${startMonth}-${endMonth}`;
    }

    function formatSessionTypes(types) {
        const priority = {
            'sprint': 1,
            'qualifyng': 2,
            'race': 3
        };
        const typeLabels = {
            'race': 'Race',
            'qualifyng': 'Qualy',
            'sprint': 'Sprint'
        };
        return types
            .sort((a, b) => (priority[a] || 99) - (priority[b] || 99))
            .map(t => typeLabels[t] || t.charAt(0).toUpperCase() + t.slice(1))
            .join(' + ');
    }

    // Split races into two columns for the grid
    const midPoint = Math.ceil(races.length / 2);
    const leftRaces = races.slice(0, midPoint);
    const rightRaces = races.slice(midPoint);

    return (
        <main>
            <section className="calendar-section page-section container text-center">
                <header className="page-header">
                    <p className="section-label">¡Un año a pura velocidad!</p>
                    <h1 className="section-title">CALENDARIO</h1>
                    <p className="section-subtitle">
                        Desde Bahréin hasta Abu Dhabi, conoce cada curva del campeonato
                    </p>
                </header>

                <div className="calendar-list calendar-grid">
                    {/* Columna izquierda */}
                    <div className="calendar-col left-col">
                        {leftRaces.map((race, index) => (
                            <article className="calendar-item" key={race._id || index}>
                                <div className="race-info">
                                    <div className="race-location">
                                        <span className="emoji-flag me-2">{getFlagEmoji(race.circuit?.country)}</span>
                                        <span className="race-country">{race.circuit.country_name || race.circuit.country}</span>
                                        <span className="race-round">/ RONDA {index + 1}</span>
                                    </div>
                                    <p className="race-circuit">{race.circuit.circuit_name}</p>
                                    <p className="race-sessions">
                                        {formatSessionTypes(race.sessionTypes)}
                                    </p>
                                </div>
                                <div className={`race-date ${getStatusClass(index)}`}>
                                    <span className="race-day">{formatDayRange(race.date_gp_start, race.date_gp_end)}</span>
                                    <span className="race-month">{formatMonthShort(race.date_gp_start, race.date_gp_end)}</span>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Columna derecha */}
                    <div className="calendar-col right-col">
                        {rightRaces.map((race, index) => (
                            <article className="calendar-item" key={race._id || index}>
                                <div className="race-info">
                                    <div className="race-location">
                                        <span className="emoji-flag me-2">{getFlagEmoji(race.circuit?.country)}</span>
                                        <span className="race-country">{race.circuit.country_name || race.circuit.country}</span>
                                        <span className="race-round">/ RONDA {midPoint + index + 1}</span>
                                    </div>
                                    <p className="race-circuit">{race.circuit.circuit_name}</p>
                                    <p className="race-sessions">
                                        {formatSessionTypes(race.sessionTypes)}
                                    </p>
                                </div>
                                <div className={`race-date ${getStatusClass(midPoint + index)}`}>
                                    <span className="race-day">{formatDayRange(race.date_gp_start, race.date_gp_end)}</span>
                                    <span className="race-month">{formatMonthShort(race.date_gp_start, race.date_gp_end)}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Calendar;
