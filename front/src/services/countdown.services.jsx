import { useState, useEffect } from "react";

export default function Countdown({ targetDate, timezone, onEnd }) {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  useEffect(() => {
    let interval;

    function calculateTimeLeft() {
      const targetMs = new Date(targetDate).getTime();
      const now = Date.now();

      let difference = targetMs - now;
      if (difference <= 0) {
        difference = 0;
      }

      const days = String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const hours = String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0");
      const minutes = String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0");
      const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");

      return { days, hours, minutes, seconds, total: difference };
    }

    function tick() {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);

      if (newTime.total === 0) {
        clearInterval(interval);
        if (onEnd) onEnd();
      }
    }

    tick();
    interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onEnd]);

  const localRaceTime = new Intl.DateTimeFormat("es-AR", {
    timeZone: timezone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(targetDate));

  return (
    <div>
      <p>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </p>
    </div>
  );
}
