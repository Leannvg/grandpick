import { useEffect, useRef, useState } from "react";

function CountdownToRace({ raceDate, totalDuration, onExpire, onStartRace }) {
  const startHandledRef = useRef(false);
  const expireHandledRef = useRef(false);

  const start = new Date(raceDate).getTime();
  const [now, setNow] = useState(Date.now());

  // Tick cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const runTime = totalDuration || 0;
  const timeToStart = start - now;
  const timeToEnd = start + runTime - now;

  // Inicio de carrera (una sola vez)
  useEffect(() => {
    if (timeToStart <= 0 && timeToEnd > 0 && !startHandledRef.current) {
      startHandledRef.current = true;
      onStartRace();
    }
  }, [timeToStart, timeToEnd, onStartRace]);

  // Fin de ventana / carrera
  useEffect(() => {
    if (timeToEnd <= 0 && !expireHandledRef.current) {
      expireHandledRef.current = true;
      onExpire();
    }
  }, [timeToEnd, onExpire]);

  function formatDHMS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // Carrera aún no empezó
  if (timeToStart > 0) {
    return (
      <p className="text-warning">
        ⏳ Tiempo restante para predecir: {formatDHMS(timeToStart)}
      </p>
    );
  }

  // Carrera + ventana terminada
  if (timeToEnd <= 0) {
    return null;
  }

  // Carrera en curso
  return (
    <p className="text-warning">
      🏁 La carrera está en curso — {formatDHMS(timeToEnd)} restantes
    </p>
  );
}

export default CountdownToRace;
