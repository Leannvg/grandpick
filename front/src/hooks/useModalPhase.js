import { useEffect, useState } from "react";

export function useModalPhase(show, closeMs = 200) {
  const [phase, setPhase] = useState(show ? "open" : "closed");

  useEffect(() => {
    if (show) {
      setPhase("open");
      return;
    }
    setPhase((p) => (p === "closed" ? "closed" : "closing"));
    const id = setTimeout(() => setPhase("closed"), closeMs);
    return () => clearTimeout(id);
  }, [show, closeMs]);

  return phase;
}
