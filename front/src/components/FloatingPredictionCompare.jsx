import { useEffect, useRef, useState } from "react";
import { useModalPhase } from "../hooks/useModalPhase";
import PredictionServices from "../services/predictions.services";
import { getSessionButtonStatus } from "./predictions/SessionTabs";
import GpCard from "./predictions/GpCard";
import PredictionComparisonTable from "./predictions/PredictionComparisonTable";
import LoaderSpinner from "./LoaderSpinner";
import { useEscapeKey } from "../hooks/useEscapeKey";

import "../assets/styles/predictionHistory.css";
import "../assets/styles/predictionCompare.css";

const COMPARE_SESSION_DEFS = [
    { id: 'sprint', label: 'SPRINT', color: 'sprint' },
    { id: 'qualifying', label: 'QUALY', color: 'qualy' },
    { id: 'race', label: 'RACE', color: 'race' },
];

/**
 * Tabs de sesión propios del modal de comparación: solo el nombre + un
 * puntito del color de la sesión (sin fecha ni puntaje, a diferencia de
 * `SessionTabs` que usa "Mi Historial"). Acá hay dos usuarios, así que un
 * puntaje suelto en el tab no decía de quién era — ya está resuelto en la
 * tabla, donde cada columna muestra el total de esa persona.
 */
function CompareSessionTabs({ sessions, selectedSessionType, onSelect }) {
    return (
        <div className="cmp-tabs">
            {COMPARE_SESSION_DEFS.map(def => {
                const session = sessions.find(s =>
                    s.type === def.id || (def.id === 'qualifying' && s.type === 'qualy')
                );
                const isSelected = selectedSessionType === def.id;
                const status = getSessionButtonStatus(session);

                return (
                    <button
                        key={def.id}
                        type="button"
                        className={`cmp-tab cmp-tab--${def.color} ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => { if (status === 'finished') onSelect(def.id); }}
                        disabled={status !== 'finished'}
                    >
                        {def.label}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * Modal de comparación de predicciones entre el usuario logueado y otro
 * usuario, para un Gran Premio puntual (usado desde Ranking > Por Gran Premio).
 *
 * Desktop (>=1200px): modal centrado (`gp-modal-overlay`/`gp-modal-card--wide`),
 * con una cruz flotante en la esquina para cerrar (ningún otro modal del
 * sitio la tiene, pero este tiene mucho contenido debajo de una tabla larga).
 * Mobile (<1200px): bottom-sheet deslizable, mismo patrón que el drawer de
 * `PredictionHistory.jsx` (overlay + tirador + gesto de arrastre), reusando
 * `.history-drawer-overlay` / `.drawer-handle` de `predictionHistory.css`;
 * sin cruz ahí, porque ya se cierra arrastrando o tocando afuera.
 */
function FloatingPredictionCompare({ show, onClose, myUserId, myLabel = "Vos", otherUserId, otherLabel, circuitId, year }) {
    const [loading, setLoading] = useState(false);
    const [myCircuitData, setMyCircuitData] = useState(null);
    const [otherCircuitData, setOtherCircuitData] = useState(null);
    const [selectedSessionType, setSelectedSessionType] = useState(null);
    const [error, setError] = useState(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200);

    useEscapeKey(show, onClose);
  const phase = useModalPhase(show);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1200);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // .body-scroll-lock pone position:fixed en el body sin compensar el
    // scroll previo, así que fijarlo lo "resetea" visualmente al top de la
    // página. Se guarda el scroll actual en body.style.top (desplazado en
    // negativo) mientras está fijo, y se restaura con window.scrollTo al
    // destrabarlo.
    useEffect(() => {
        if (show && !isDesktop) {
            const scrollY = window.scrollY;
            document.body.style.top = `-${scrollY}px`;
            document.body.classList.add("body-scroll-lock");
        } else {
            const lockedScrollY = document.body.style.top;
            document.body.classList.remove("body-scroll-lock");
            document.body.style.top = "";
            if (lockedScrollY) {
                window.scrollTo(0, -parseInt(lockedScrollY, 10));
            }
        }
        return () => {
            const lockedScrollY = document.body.style.top;
            document.body.classList.remove("body-scroll-lock");
            document.body.style.top = "";
            if (lockedScrollY) {
                window.scrollTo(0, -parseInt(lockedScrollY, 10));
            }
        };
    }, [show, isDesktop]);

    useEffect(() => {
        if (!show || !myUserId || !otherUserId || !circuitId) return;

        async function loadData() {
            setLoading(true);
            setError(null);
            setMyCircuitData(null);
            setOtherCircuitData(null);
            setSelectedSessionType(null);

            try {
                const [myHistory, otherHistory] = await Promise.all([
                    PredictionServices.findHistoryByUser(myUserId, year),
                    PredictionServices.findHistoryByUser(otherUserId, year)
                ]);

                const myData = myHistory.find(h => h.circuit._id === circuitId) || null;
                const otherData = otherHistory.find(h => h.circuit._id === circuitId) || null;

                setMyCircuitData(myData);
                setOtherCircuitData(otherData);

                if (myData) {
                    const bestSession = myData.sessions.find(s => s.results?.length > 0 || s.prediction) || myData.sessions[0];
                    setSelectedSessionType(bestSession?.type || "race");
                }
            } catch (err) {
                console.error("Error loading comparison:", err);
                setError("No se pudieron cargar las predicciones.");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [show, myUserId, otherUserId, circuitId, year]);

    const mySession = myCircuitData?.sessions?.find(s =>
        s.type === selectedSessionType || (selectedSessionType === 'qualifying' && s.type === 'qualy')
    );
    const otherSession = otherCircuitData?.sessions?.find(s =>
        s.type === selectedSessionType || (selectedSessionType === 'qualifying' && s.type === 'qualy')
    );

    const hasNoData = !loading && !error && (!myCircuitData || !otherCircuitData);
    const circuitData = myCircuitData || otherCircuitData;
    const circuit = circuitData?.circuit || null;

    // Deslizar para cerrar (solo desde el tirador/encabezado del drawer en mobile)
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef(0);

    const onDragStart = (e) => {
        dragStartRef.current = e.clientY;
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onDragMove = (e) => {
        if (!dragging) return;
        setDragY(Math.max(0, e.clientY - dragStartRef.current));
    };
    const onDragEnd = () => {
        if (!dragging) return;
        setDragging(false);
        if (dragY > 100) onClose();
        else setDragY(0);
    };

    const gpCard = <GpCard circuit={circuit} dateStart={circuitData?.date_gp_start} dateEnd={circuitData?.date_gp_end} />;

    const body = (
        <>
            {loading && (
                <div className="py-4">
                    <LoaderSpinner />
                </div>
            )}

            {!loading && error && (
                <p className="gp-modal-subtitle">{error}</p>
            )}

            {hasNoData && (
                <p className="gp-modal-subtitle">Sin predicciones para este Gran Premio.</p>
            )}

            {!loading && !error && myCircuitData && otherCircuitData && (
                <>
                    <CompareSessionTabs
                        sessions={myCircuitData.sessions}
                        selectedSessionType={selectedSessionType}
                        onSelect={setSelectedSessionType}
                    />

                    <PredictionComparisonTable
                        session={mySession}
                        otherSession={otherSession}
                        myLabel={myLabel}
                        otherLabel={otherLabel}
                    />
                </>
            )}
        </>
    );

    if (phase === "closed") return null;

    const dialogLabel = `Comparación de predicciones: ${myLabel} vs. ${otherLabel}`;

    const sheetContent = (
        <>
            <div className="drawer-handle"></div>
            <div className="gp-compare-drawer-header">
                {gpCard}
            </div>
        </>
    );

    if (!isDesktop) {
        return (
            <>
                <div
                    className={`history-drawer-overlay is-open gp-drawer-overlay--css ${phase === "closing" ? "is-closing" : ""}`}
                    onClick={onClose}
                />
                <div
                    className={`gp-compare-drawer gp-compare-drawer--css ${phase === "closing" ? "is-closing" : ""} ${dragging ? "is-dragging" : ""}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={dialogLabel}
                    style={{ transform: `translateY(${dragY}px)` }}
                >
                    <div
                        className="gp-compare-drag-zone"
                        style={{ touchAction: "none" }}
                        onPointerDown={onDragStart}
                        onPointerMove={onDragMove}
                        onPointerUp={onDragEnd}
                        onPointerCancel={onDragEnd}
                    >
                        {sheetContent}
                    </div>

                    <div className="gp-compare-drawer-body">
                        {body}
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className={`gp-modal-overlay gp-modal-overlay--css ${phase === "closing" ? "is-closing" : ""}`}>
            {/* Envoltorio propio (no .gp-modal-card directamente) para que la cruz,
                posicionada semi-afuera de la esquina, no quede recortada por el
                overflow-y:auto que .gp-modal-card necesita para scrollear la tabla
                larga sin desbordar el viewport. */}
            <div className="cmp-modal-wrap">
                <button type="button" className="gp-modal-close" onClick={onClose} aria-label="Cerrar">
                    <i className="bi bi-x-lg"></i>
                </button>

                <div
                    className="gp-modal-card gp-modal-card--wide"
                    role="dialog"
                    aria-modal="true"
                    aria-label={dialogLabel}
                >
                    {gpCard}

                    {body}
                </div>
            </div>
        </div>
    );
}

export default FloatingPredictionCompare;
