import { useEffect, useRef, useState } from "react";
import "./predictionCards.css";

// Pedido: "si tuvieras que rediseñar los selects para que queden bien con
// el banner y la transparencia, cómo lo harías? se puede agregar algún
// diseño nuevo... que se pueda mover los pilotos de posición arrastrando?"
//
// Dos cambios respecto al diseño real (predictions.css):
// 1) Cards tipo vidrio (blur + fondo semitransparente + borde sutil) en
//    vez de card blanco opaco — mismo lenguaje visual que GpHeroBanner.
// 2) Reordenar arrastrando: cada fila tiene una manija (ícono de puntos)
//    — al arrastrarla verticalmente, la fila "salta" de posición y las
//    demás se corren con una animación suave. El selector de piloto
//    sigue ahí para ELEGIR quién ocupa cada posición; el arrastre es
//    para REORDENAR a los que ya están, sin tener que re-seleccionar uno
//    por uno. Colores de escudería reales (2025), orden inicial = grilla
//    real, para que el gesto de "arrastrar a mi pronóstico" se sienta
//    natural en vez de arrancar de cero.
const TEAM = {
  mercedes: "#27F4D2",
  redbull: "#3671C6",
  racingBulls: "#6692FF",
  ferrari: "#E8002D",
  sauber: "#52E252",
  alpine: "#00A1E8",
  haas: "#B6BABD",
  mclaren: "#FF8000",
  astonMartin: "#229971",
  williams: "#64C4FF",
};

const ALL_DRIVERS = [
  { _id: "antonelli", full_name: "Kimi Antonelli", teamName: "Mercedes", color: TEAM.mercedes },
  { _id: "russell", full_name: "George Russell", teamName: "Mercedes", color: TEAM.mercedes },
  { _id: "verstappen", full_name: "Max Verstappen", teamName: "Red Bull", color: TEAM.redbull },
  { _id: "tsunoda", full_name: "Yuki Tsunoda", teamName: "Red Bull", color: TEAM.redbull },
  { _id: "hadjar", full_name: "Isack Hadjar", teamName: "Racing Bulls", color: TEAM.racingBulls },
  { _id: "lawson", full_name: "Liam Lawson", teamName: "Racing Bulls", color: TEAM.racingBulls },
  { _id: "hamilton", full_name: "Lewis Hamilton", teamName: "Ferrari", color: TEAM.ferrari },
  { _id: "leclerc", full_name: "Charles Leclerc", teamName: "Ferrari", color: TEAM.ferrari },
  { _id: "hulkenberg", full_name: "Nico Hulkenberg", teamName: "Kick Sauber", color: TEAM.sauber },
  { _id: "bortoleto", full_name: "Gabriel Bortoleto", teamName: "Kick Sauber", color: TEAM.sauber },
  { _id: "colapinto", full_name: "Franco Colapinto", teamName: "Alpine", color: TEAM.alpine },
  { _id: "gasly", full_name: "Pierre Gasly", teamName: "Alpine", color: TEAM.alpine },
  { _id: "bearman", full_name: "Oliver Bearman", teamName: "Haas", color: TEAM.haas },
  { _id: "ocon", full_name: "Esteban Ocon", teamName: "Haas", color: TEAM.haas },
  { _id: "norris", full_name: "Lando Norris", teamName: "McLaren", color: TEAM.mclaren },
  { _id: "piastri", full_name: "Oscar Piastri", teamName: "McLaren", color: TEAM.mclaren },
  { _id: "alonso", full_name: "Fernando Alonso", teamName: "Aston Martin", color: TEAM.astonMartin },
  { _id: "lindblad", full_name: "Arvid Lindblad", teamName: "Aston Martin", color: TEAM.astonMartin },
  { _id: "sainz", full_name: "Carlos Sainz", teamName: "Williams", color: TEAM.williams },
  { _id: "albon", full_name: "Alex Albon", teamName: "Williams", color: TEAM.williams },
];

const INITIAL_ORDER = [
  "antonelli", "russell", "verstappen", "hadjar", "hamilton",
  "lawson", "hulkenberg", "lindblad", "colapinto", "bearman",
];

const ROW_H = 56;
const GAP = 10;
const STEP = ROW_H + GAP;

function splitName(fullName) {
  const parts = fullName.split(" ");
  const last = parts.pop();
  return { first: parts.join(" "), last };
}

function DriverPicker({ driver, onSelect, takenIds, open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  // Pedido: "cómo lo harías?" — el panel es position:absolute DENTRO de
  // .pcp-card, que a su vez tiene su propio z-index (position+z-index
  // siempre crea un nuevo contexto de apilado). Eso "atrapa" el z-index
  // alto del panel adentro del contexto de SU card — no alcanza para
  // ganarle a una card HERMANA (otro contexto de apilado, mismo z-index
  // base, pero más abajo en el DOM, así que pinta encima igual). Por eso
  // "open" vive en el padre (PredictionCardsPrototype): cuando el picker
  // de una fila se abre, esa fila entera sube de z-index (no solo el
  // panel), y ahí sí gana contra las de abajo. Mismo bug, mismo arreglo
  // que el z-index del clima en el banner (ver gpHero.css).
  useEffect(() => {
    if (!open) return;
    const onPointerDownOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        onOpenChange(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onPointerDownOutside);
    return () => document.removeEventListener("pointerdown", onPointerDownOutside);
  }, [open, onOpenChange]);

  const q = query.trim().toLowerCase();
  const filtered = ALL_DRIVERS.filter((d) =>
    d.full_name.toLowerCase().includes(q) || d.teamName.toLowerCase().includes(q)
  );
  const { first, last } = splitName(driver.full_name);

  return (
    <div className={`pcp-picker ${open ? "is-open" : ""}`} ref={rootRef}>
      <button type="button" className="pcp-picker__control" onClick={() => onOpenChange(!open)}>
        <span className="pcp-picker__dot" style={{ background: driver.color, color: driver.color }}></span>
        <span className="pcp-picker__name">
          <span className="pcp-picker__first">{first}</span>
          <span className="pcp-picker__last">{last}</span>
        </span>
        <svg className="pcp-picker__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="pcp-picker__panel">
          <input
            type="text"
            className="pcp-picker__search"
            placeholder="Buscar piloto o escudería..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="pcp-picker__options">
            {filtered.map((d) => {
              const isTaken = takenIds.includes(d._id) && d._id !== driver._id;
              return (
                <button
                  type="button"
                  key={d._id}
                  className={`pcp-picker__option ${d._id === driver._id ? "is-selected" : ""}`}
                  onClick={() => {
                    onSelect(d._id);
                    onOpenChange(false);
                    setQuery("");
                  }}
                >
                  <span className="pcp-picker__dot" style={{ background: d.color, color: d.color }}></span>
                  <span className="pcp-picker__option-name">{d.full_name}</span>
                  <span className="pcp-picker__option-team">{d.teamName}</span>
                  {isTaken && <span className="pcp-picker__taken-badge">Ya elegido</span>}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="pcp-picker__empty">Sin resultados</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function PredictionCardsPrototype() {
  const [order, setOrder] = useState(INITIAL_ORDER);
  const [dragSlot, setDragSlot] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [openSlot, setOpenSlot] = useState(null);
  const dragStartClientY = useRef(0);

  const onHandlePointerDown = (slot, e) => {
    setDragSlot(slot);
    setDragY(0);
    dragStartClientY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e) => {
    if (dragSlot === null) return;
    const delta = e.clientY - dragStartClientY.current;
    setDragY(delta);

    const targetSlot = Math.min(order.length - 1, Math.max(0, Math.round(dragSlot + delta / STEP)));
    if (targetSlot !== dragSlot) {
      setOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragSlot, 1);
        next.splice(targetSlot, 0, moved);
        return next;
      });
      dragStartClientY.current += (targetSlot - dragSlot) * STEP;
      setDragSlot(targetSlot);
    }
  };

  const onHandlePointerUp = () => {
    setDragSlot(null);
    setDragY(0);
  };

  const handleSwap = (slot, selectedId) => {
    setOrder((prev) => {
      const next = [...prev];
      const existingSlot = next.indexOf(selectedId);
      if (existingSlot !== -1 && existingSlot !== slot) {
        [next[slot], next[existingSlot]] = [next[existingSlot], next[slot]];
      } else {
        next[slot] = selectedId;
      }
      return next;
    });
  };

  return (
    <div className="pcp-root">
      <p className="pcp-hint">Arrastrá el ícono de la derecha para reordenar</p>
      <div className="pcp-list" style={{ height: order.length * STEP - GAP }}>
        {order.map((driverId, slot) => {
          const driver = ALL_DRIVERS.find((d) => d._id === driverId);
          const isDragging = dragSlot === slot;
          const y = isDragging ? slot * STEP + dragY : slot * STEP;
          return (
            <div
              key={driverId}
              className={`pcp-card ${isDragging ? "is-dragging" : ""} ${openSlot === slot ? "is-picker-open" : ""}`}
              style={{
                transform: `translateY(${y}px)`,
                transition: isDragging ? "none" : "transform .22s cubic-bezier(.2,.8,.2,1)",
              }}
            >
              <span className="pcp-card__rank">{String(slot + 1).padStart(2, "0")}</span>
              <span className="pcp-card__color" style={{ background: driver.color }}></span>
              <div className="pcp-card__picker-wrap">
                <DriverPicker
                  driver={driver}
                  onSelect={(id) => handleSwap(slot, id)}
                  takenIds={order}
                  open={openSlot === slot}
                  onOpenChange={(next) => setOpenSlot(next ? slot : null)}
                />
              </div>
              <button
                type="button"
                className="pcp-card__handle"
                onPointerDown={(e) => onHandlePointerDown(slot, e)}
                onPointerMove={onHandlePointerMove}
                onPointerUp={onHandlePointerUp}
                onPointerCancel={onHandlePointerUp}
                aria-label={`Arrastrar para cambiar la posición ${slot + 1}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="5" cy="3" r="1.3" /><circle cx="11" cy="3" r="1.3" />
                  <circle cx="5" cy="8" r="1.3" /><circle cx="11" cy="8" r="1.3" />
                  <circle cx="5" cy="13" r="1.3" /><circle cx="11" cy="13" r="1.3" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PredictionCardsPrototype;
