import { useEffect, useRef, useState } from "react";
import { useModalPhase } from "../hooks/useModalPhase";
import PredictionServices from "../services/predictions.services";
import SessionTabs from "./predictions/SessionTabs";
import PredictionComparisonTable from "./predictions/PredictionComparisonTable";
import LoaderSpinner from "./LoaderSpinner";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { getFlagEmoji, formatRaceDate } from "../utils/helpers";
import "../assets/styles/predictionHistory.css";

/**
 * Modal de comparación de predicciones entre el usuario logueado y otro
 * usuario, para un Gran Premio puntual (usado desde Ranking > Por Gran Premio).
 *
 * Desktop (>=1200px): modal centrado (`gp-modal-overlay`/`gp-modal-card--wide`)
 * con encabezado "VOS vs. {otro}" (`.gp-compare-title`).
 * Mobile (<1200px): bottom-sheet deslizable, mismo patrón que el drawer de
 * `PredictionHistory.jsx` (overlay + tirador + gesto de arrastre), reusando
 * `.history-drawer-overlay` / `.drawer-handle` de `predictionHistory.css`.
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

    useEffect(() => {
        if (show && !isDesktop) {
            document.body.classList.add("body-scroll-lock");
        } else {
            document.body.classList.remove("body-scroll-lock");
        }
        return () => {
            document.body.classList.remove("body-scroll-lock");
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
    const circuitDateLabel = circuitData
        ? formatRaceDate(circuitData.date_gp_start, circuitData.date_gp_end)
        : null;

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

    const compareTitle = (
        <h2 id="dialog-title-compare" className="gp-compare-title">
            <span className="gp-compare-name gp-compare-name--me">{myLabel}</span>
            <span className="gp-compare-vs">VS</span>
            <span className="gp-compare-name gp-compare-name--other">{otherLabel}</span>
        </h2>
    );

    const compareSubtitle = circuit && (
        <p className="gp-modal-subtitle gp-compare-subtitle">
            <span className="emoji-flag">{getFlagEmoji(circuit.country)}</span>
            <span className="gp-compare-subtitle-name">{circuit.gp_name}</span>
            {circuitDateLabel && (
                <>
                    <span className="gp-compare-subtitle-sep">·</span>
                    <span className="gp-compare-subtitle-date">{circuitDateLabel}</span>
                </>
            )}
        </p>
    );

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
                    <SessionTabs
                        sessions={myCircuitData.sessions}
                        selectedSessionType={selectedSessionType}
                        onSelect={setSelectedSessionType}
                    />

                    <PredictionComparisonTable
                        session={mySession}
                        otherSession={otherSession}
                        otherLabel={otherLabel}
                    />
                </>
            )}
        </>
    );

    if (phase === "closed") return null;

    const sheetContent = (
        <>
            <div className="drawer-handle"></div>
            <div className="gp-compare-drawer-header">
                {compareTitle}
                {compareSubtitle}
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
                    aria-labelledby="dialog-title-compare"
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
            <div
                className="gp-modal-card gp-modal-card--wide"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title-compare"
            >
                {compareTitle}
                {compareSubtitle}

                {body}

                <div className="gp-modal-actions">
                    <button className="gp-btn-cancel" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FloatingPredictionCompare;
