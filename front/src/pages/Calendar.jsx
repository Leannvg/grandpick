import { useEffect, useState, useCallback } from "react";
import racesServices from "../services/races.services";
import { useLoader } from "../context/LoaderContext";
import { DateTime } from "luxon";
import { onSocketReady } from "../socket";
import { getCountries } from "../services/countries.services";
import Reveal from "../components/Reveal";
import CalendarCard from "../components/calendar/CalendarCard";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const pad2 = (n) => String(n).padStart(2, "0");

function Calendar() {
    const [races, setRaces] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const { showLoader, hideLoader } = useLoader();

    const loadRaces = useCallback(async (isSilent = false) => {
        if (!isSilent) showLoader();
        try {
            const currentYear = new Date().getFullYear();
            const data = await racesServices.findAllByYear(currentYear);

            const groupedMap = new Map();
            data.forEach(race => {
                const circuitId = race.id_circuit?._id || race.id_circuit || (race.circuit?._id);
                const key = `${circuitId}_${race.date_gp_start}`;

                if (!groupedMap.has(key)) {
                    groupedMap.set(key, {
                        ...race,
                        sessionTypes: [race.points_system.type],
                        sessions: [race]
                    });
                } else {
                    const existing = groupedMap.get(key);
                    if (!existing.sessionTypes.includes(race.points_system.type)) {
                        existing.sessionTypes.push(race.points_system.type);
                    }
                    existing.sessions.push(race);

                    // Mantener la fecha de fin más tardía del grupo
                    if (new Date(race.date_gp_end) > new Date(existing.date_gp_end)) {
                        existing.date_gp_end = race.date_gp_end;
                    }

                    // Mantener la fecha de inicio más temprana (por si acaso)
                    if (new Date(race.date_gp_start) < new Date(existing.date_gp_start)) {
                        existing.date_gp_start = race.date_gp_start;
                    }

                    // Actualizar estado: si alguna sesión NO está finalizada, el GP sigue vigente
                    if (existing.state === "Finalizado" && race.state !== "Finalizado") {
                        existing.state = race.state;
                    }
                }
            });

            const sortedData = Array.from(groupedMap.values()).sort((a, b) => new Date(a.date_gp_start) - new Date(b.date_gp_start));

            try {
                const countriesData = await getCountries();
                if (countriesData && Array.isArray(countriesData)) {
                    const countryMap = {};
                    countriesData.forEach(c => {
                        countryMap[c.iso2] = c.name;
                    });
                    sortedData.forEach(race => {
                        if (race.circuit && race.circuit.country) {
                            race.circuit.country_name = countryMap[race.circuit.country] || race.circuit.country;
                        }
                    });
                }
            } catch (err) {
                console.error("Error fetching countries:", err);
            }

            const now = DateTime.now().toMillis();
            const index = sortedData.findIndex(race => {
                const isFinished = race.state === "Finalizado";
                const tz = race.circuit?.timezone || "local";
                const endTime = DateTime.fromISO(race.date_gp_end).setZone(tz).endOf('day').toMillis();

                return !isFinished && endTime >= now;
            });
            setCurrentIndex(index);
            setRaces(sortedData);
        } catch (error) {
            console.error("Error al obtener las carreras:", error);
        } finally {
            if (!isSilent) hideLoader();
        }
    }, [showLoader, hideLoader]);

    useEffect(() => {
        loadRaces();

        let currentSocket = null;
        const handleRacesUpdated = () => loadRaces(true);

        const cleanup = onSocketReady((socket) => {
            currentSocket = socket;
            socket.on("races:updated", handleRacesUpdated);
        });

        return () => {
            if (cleanup) cleanup();
            if (currentSocket) {
                currentSocket.off("races:updated", handleRacesUpdated);
            }
        };
    }, [loadRaces]);

    function getStatus(index) {
        if (currentIndex === -1) return "finished";
        if (index < currentIndex) return "finished";
        if (index > currentIndex) return "upcoming";
        const race = races[index];
        const tz = race.circuit?.timezone || "local";
        const startOfDay = DateTime.fromISO(race.date_gp_start).setZone(tz).startOf("day").toMillis();
        return DateTime.now().toMillis() >= startOfDay ? "current" : "next";
    }

    function formatDayRange(startDate, endDate, timezone = "local") {
        const start = DateTime.fromISO(startDate).setZone(timezone);
        const end = DateTime.fromISO(endDate).setZone(timezone);
        const a = pad2(start.day);
        const b = pad2(end.day);

        if (a === b) return a;
        return `${a}–${b}`;
    }

    function formatMonthShort(startDate, endDate, timezone = "local") {
        const start = DateTime.fromISO(startDate).setZone(timezone);
        const end = DateTime.fromISO(endDate).setZone(timezone);

        const startMonth = MONTHS[start.month - 1];
        const endMonth = MONTHS[end.month - 1];

        if (startMonth === endMonth) return startMonth;
        return `${startMonth}-${endMonth}`;
    }

    const midPoint = Math.ceil(races.length / 2);
    const leftRaces = races.slice(0, midPoint);
    const rightRaces = races.slice(midPoint);

    const renderCard = (race, globalIndex) => (
        <Reveal
            key={race._id || globalIndex}
            delay={Math.min((globalIndex % midPoint) * 0.05, 0.4)}
        >
            <CalendarCard
                race={race}
                roundNumber={globalIndex + 1}
                status={getStatus(globalIndex)}
                dayLabel={formatDayRange(race.date_gp_start, race.date_gp_end, race.circuit?.timezone)}
                monthLabel={formatMonthShort(race.date_gp_start, race.date_gp_end, race.circuit?.timezone)}
            />
        </Reveal>
    );

    return (
        <div className="calendar-page page-wrapper">
            <section className="page-section container text-center">
                <header className="page-header">
                    <p className="section-label">¡Un año a pura velocidad!</p>
                    <h1 className="section-title">CALENDARIO</h1>
                    <p className="section-subtitle">
                        Desde Bahréin hasta Abu Dhabi, conoce cada curva del campeonato
                    </p>
                </header>

                <div className="calendar-grid">
                    <div className="calendar-col">
                        {leftRaces.map((race, i) => renderCard(race, i))}
                    </div>
                    <div className="calendar-col">
                        {rightRaces.map((race, i) => renderCard(race, midPoint + i))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Calendar;
