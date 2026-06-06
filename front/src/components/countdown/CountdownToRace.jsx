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

  const runTime = totalDuration || 5400000; // 1.5 horas por defecto (ms)
  const timeToStart = start - now;
  const timeToEnd = start + runTime - now;

  // Inicio de carrera (una sola vez)
  useEffect(() => {
    if (timeToStart <= 0 && timeToEnd > 0 && !startHandledRef.current) {
      startHandledRef.current = true;
      onStartRace();
    }
  }, [timeToStart, timeToEnd, onStartRace]);

  // Fin de ventana ya no aplica, quitamos onExpire porque depende de Finalizado
  // useEffect(() => {
  //   if (timeToEnd <= 0 && !expireHandledRef.current) {
  //     expireHandledRef.current = true;
  //     onExpire();
  //   }
  // }, [timeToEnd, onExpire]);

  function formatDHMS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}D: ${hours}HS: ${minutes}MIN: ${seconds} SEG`;
  }

  // Carrera aún no empezó
  if (timeToStart > 0) {
    return (
      <p>
        {formatDHMS(timeToStart)}
      </p>
    );
  }

  // Carrera en curso o esperando resultados
  return (
    <div className="countdown-in-progress" style={{ margin: '20px 0', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
      <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🏁 La sesión está en curso</p>
      <p style={{ color: '#aaa', fontSize: '0.95rem', margin: 0 }}>Esperando resultados oficiales para avanzar a la siguiente sesión.</p>
    </div>
  );
}

export default CountdownToRace;
