import { useEffect, useState } from "react";
import racesServices from "../services/races.services";
import * as countriesServices from "../services/countries.services";
import { computeRaceState } from "../utils/helpers";
import { onSocketReady } from "../socket";

/**
 * Countdown en vivo + status (computeRaceState) para una carrera ya
 * obtenida — extraído de useNextRace() para que GpHeroBanner.jsx lo pueda
 * usar también en la variante de Predictions.jsx, donde la carrera NO se
 * vuelve a pedir (Predictions.jsx ya hace su propio fetch con lógica
 * propia de pre-window/predicción guardada) sino que se recibe por prop.
 * Mismo comportamiento de siempre, sin cambios de fondo.
 */
export function useRaceCountdown(race) {
    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00"
    });
    const [status, setStatus] = useState({ isClosed: false, isInProgress: false, canPredict: false, isPreWindow: false });

    useEffect(() => {
        if (!race) return;

        // Pedido: "al cargar se ve el botón de predecir y tarda un poco en
        // cambiar a 'en curso'" — setInterval no corre su callback de
        // inmediato, solo después de 1seg. Hasta ese primer tick, `status`
        // se queda en el default (isInProgress: false) aunque la carrera ya
        // esté en curso, y GpHeroBanner muestra el CTA equivocado por un
        // instante. Se corre el cálculo una vez de entrada (tick()) y
        // después se repite cada 1seg con el interval, en vez de esperar al
        // primer tick del interval para el primer cálculo.
        const tick = () => {
            const now = Date.now();
            const startMs = new Date(race.date_race).getTime();
            const duration = race.totalDuration || 5400000;
            const endMs = startMs + duration;

            const currentStatus = computeRaceState(race);
            setStatus(currentStatus);

            let difference = 0;
            if (currentStatus.isInProgress) {
                // Si está en curso, el contador muestra cuánto falta para el FIN de las 2 horas
                difference = endMs - now;
            } else {
                // Si es futura, muestra cuánto falta para el INICIO
                difference = startMs - now;
            }

            if (difference <= 0) {
                difference = 0;
            }

            const days = String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0");
            const hours = String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0");
            const minutes = String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0");
            const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");

            setTimeLeft({ days, hours, minutes, seconds });
        };

        tick();
        const interval = setInterval(tick, 1000);

        return () => clearInterval(interval);
    }, [race]);

    return { timeLeft, status };
}

/**
 * Carrera actual o próxima + countdown en vivo + nombre de país — extraído
 * de NextRaceCTA.jsx para que GpHeroBanner.jsx (hero de Home) lo reuse sin
 * duplicar el fetch/socket/intervalo. Mismo comportamiento, sin cambios:
 * re-fetch en el evento socket "races:updated", countdown vía
 * useRaceCountdown() arriba.
 */
export function useNextRace() {
    const [race, setRace] = useState(null);
    const [countryName, setCountryName] = useState("");

    async function fetchNextRace() {
        try {
            const data = await racesServices.findCurrentOrNext();
            if (data) {
                setRace(data);

                const countryIso = data.circuit?.country || data.id_circuit?.country;
                if (countryIso) {
                    try {
                        const country = await countriesServices.getOneCountry(countryIso);
                        setCountryName(country?.name || countryIso);
                    } catch (err) {
                        console.error("Error fetching country name:", err);
                    }
                }
            } else {
                setRace(null);
            }
        } catch (error) {
            console.error("Error fetching next race:", error);
        }
    }

    useEffect(() => {
        fetchNextRace();

        let currentSocket = null;
        const handleRacesUpdated = () => fetchNextRace();

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
    }, []);

    const { timeLeft, status } = useRaceCountdown(race);

    return { race, countryName, timeLeft, status };
}
