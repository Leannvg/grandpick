import { useEffect, useState } from "react";

function CountdownToOpen({ timeToOpen, onOpen }) {
  const [timeLeft, setTimeLeft] = useState(timeToOpen ?? 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          onOpen();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onOpen]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <p className="text-danger">
      ⏳ Las predicciones se habilitarán en{" "}
      {days}d {hours}h {minutes}m {seconds}s
    </p>
  );
}

export default CountdownToOpen;
