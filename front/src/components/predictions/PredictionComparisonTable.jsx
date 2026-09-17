const QUALY_POINTS_ADJUST_CUTOFF = new Date('2026-05-03T00:00:00Z');

/**
 * Calcula si una predicción acertó la posición y los puntos que corresponden,
 * aplicando el ajuste histórico de qualy (/3 antes del 2026-05-03).
 */
function calcPrediction(session, idx, pred, real) {
    const isMatch = !!(pred && real && pred.driver._id === real.driver._id);
    let points = isMatch ? session?.points_system?.points?.[idx] : 0;

    if (isMatch && session?.type?.toLowerCase().includes('qual')) {
        const sessionDate = new Date(session.date_race);
        if (sessionDate < QUALY_POINTS_ADJUST_CUTOFF) {
            points = points / 3;
        }
    }

    return { isMatch, points };
}

/**
 * Tabla de comparación predicción vs. resultado real, reutilizada en
 * PredictionHistory ("Mi Historial") y en el modal de comparación entre
 * dos usuarios (FloatingPredictionCompare).
 *
 * - Sin `otherSession`: 4 columnas (comportamiento original, sin cambios).
 * - Con `otherSession` + `otherLabel`: 5 columnas, agregando la predicción
 *   del otro usuario y mostrando los puntos de ambos lado a lado.
 */
function PredictionComparisonTable({ session, otherSession = null, otherLabel = null }) {
    const length = session?.points_system?.points?.length || 10;
    const compareMode = !!otherSession;

    return (
        <div className={`prediction-comparison-table ${compareMode ? 'prediction-comparison-table--compare' : ''}`}>
            <div className="table-header">
                <div className="col-pos">Pos</div>
                <div className="col-pred">Tu predicción</div>
                {compareMode && <div className="col-other-pred">Predicción de {otherLabel}</div>}
                <div className="col-real">Resultado real</div>
                <div className="col-points">Puntos</div>
            </div>
            <div className="table-body">
                {Array.from({ length }).map((_, idx) => {
                    const pos = idx + 1;
                    const pred = session?.prediction?.find(p => p.position === pos);
                    const real = session?.results?.find(r => r.position === pos);
                    const { isMatch, points } = calcPrediction(session, idx, pred, real);

                    let otherPred = null;
                    let otherCalc = { isMatch: false, points: 0 };
                    if (compareMode) {
                        otherPred = otherSession?.prediction?.find(p => p.position === pos);
                        otherCalc = calcPrediction(otherSession, idx, otherPred, real);
                    }

                    return (
                        <div key={pos} className={`table-row ${pred && !isMatch && real ? 'no-match' : ''}`}>
                            <div className="col-pos">{pos}</div>
                            <div className="col-pred">
                                {pred ? (
                                    <>
                                        <div className="driver-color-bar" style={{ backgroundColor: pred.driver.team_info?.color || '#ccc' }}></div>
                                        <span className="driver-name">{pred.driver.full_name.split(' ')[0]} <strong>{pred.driver.full_name.split(' ').slice(1).join(' ')}</strong></span>
                                    </>
                                ) : '-'}
                            </div>

                            {compareMode && (
                                <div className="col-other-pred">
                                    {otherPred ? (
                                        <>
                                            <div className="driver-color-bar" style={{ backgroundColor: otherPred.driver.team_info?.color || '#ccc' }}></div>
                                            <span className="driver-name">{otherPred.driver.full_name.split(' ')[0]} <strong>{otherPred.driver.full_name.split(' ').slice(1).join(' ')}</strong></span>
                                        </>
                                    ) : '-'}
                                </div>
                            )}

                            <div className="col-real">
                                {real ? (
                                    <>
                                        <div className="driver-color-bar" style={{ backgroundColor: real.driver.team_info?.color || '#ccc' }}></div>
                                        <span className="driver-name">{real.driver.full_name.split(' ')[0]} <strong>{real.driver.full_name.split(' ').slice(1).join(' ')}</strong></span>
                                    </>
                                ) : '-'}
                            </div>

                            {compareMode ? (
                                <div className="col-points col-points--compare">
                                    <span className={`points-pill ${isMatch ? 'match' : (pred && real ? 'mismatch' : '')}`}>
                                        Vos: {isMatch ? points : (pred && real ? 0 : '-')}
                                    </span>
                                    <span className={`points-pill ${otherCalc.isMatch ? 'match' : (otherPred && real ? 'mismatch' : '')}`}>
                                        {otherLabel}: {otherCalc.isMatch ? otherCalc.points : (otherPred && real ? 0 : '-')}
                                    </span>
                                </div>
                            ) : (
                                <div className={`col-points ${isMatch ? 'match' : (pred && real ? 'mismatch' : '')}`}>
                                    {isMatch ? points : (pred && real ? 0 : '-')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PredictionComparisonTable;
