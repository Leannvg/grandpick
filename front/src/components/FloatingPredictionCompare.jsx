import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PredictionServices from "../services/predictions.services";
import SessionTabs from "./predictions/SessionTabs";
import PredictionComparisonTable from "./predictions/PredictionComparisonTable";
import LoaderSpinner from "./LoaderSpinner";

/**
 * Modal de comparación de predicciones entre el usuario logueado y otro
 * usuario, para un Gran Premio puntual (usado desde Ranking > Por Gran Premio).
 */
function FloatingPredictionCompare({ show, onClose, myUserId, myLabel = "Vos", otherUserId, otherLabel, circuitId, year }) {
    const [loading, setLoading] = useState(false);
    const [myCircuitData, setMyCircuitData] = useState(null);
    const [otherCircuitData, setOtherCircuitData] = useState(null);
    const [selectedSessionType, setSelectedSessionType] = useState(null);
    const [error, setError] = useState(null);

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

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="gp-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="gp-modal-card gp-modal-card--wide"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dialog-title-compare"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <h2 id="dialog-title-compare" className="gp-modal-title">
                            Comparar predicciones: {myLabel} vs. {otherLabel}
                        </h2>

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

                        <div className="gp-modal-actions">
                            <button className="gp-btn-cancel" onClick={onClose}>
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default FloatingPredictionCompare;
