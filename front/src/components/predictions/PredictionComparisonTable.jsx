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
 * Piloto + barra de color de equipo (o "-" si no hay dato). Reutilizado en
 * las columnas de predicción y resultado real.
 */
function DriverCell({ item }) {
    if (!item) return '-';
    return (
        <>
            <div className="driver-color-bar" style={{ backgroundColor: item.driver.team_info?.color || '#ccc' }}></div>
            <span className="driver-name">{item.driver.full_name.split(' ')[0]} <strong>{item.driver.full_name.split(' ').slice(1).join(' ')}</strong></span>
        </>
    );
}

/**
 * Tabla de comparación predicción vs. resultado real, reutilizada en
 * PredictionHistory ("Mi Historial") y en el modal de comparación entre
 * dos usuarios (FloatingPredictionCompare).
 *
 * - Sin `otherSession`: 4 columnas (comportamiento original, sin cambios):
 *   Pos | Tu predicción | Resultado real | Puntos.
 * - Con `otherSession` + `otherLabel`: 6 columnas, con el resultado real
 *   primero (después de Pos) y los puntos de cada usuario pegados a la
 *   derecha de su propia columna de predicción: Pos | Resultado real |
 *   Tu predicción | Puntos | Predicción de {otherLabel} | Puntos. Cada
 *   predicción errada se marca en rojo de forma independiente (no toda la
 *   fila), para no confundir cuando un usuario acierta y el otro no.
 */
function PredictionComparisonTable({ session, otherSession = null, otherLabel = null }) {
    const length = session?.points_system?.points?.length || 10;
    const compareMode = !!otherSession;

    if (compareMode) {
        return (
            <div className="prediction-comparison-table-scroll">
            <div className="prediction-comparison-table prediction-comparison-table--compare">
                <div className="table-header">
                    <div className="col-pos">Pos</div>
                    <div className="col-real">Resultado real</div>
                    <div className="col-pred">Tu predicción</div>
                    <div className="col-points">Puntos</div>
                    <div className="col-other-pred">Predicción de {otherLabel}</div>
                    <div className="col-points">Puntos</div>
                </div>
                <div className="table-body">
                    {Array.from({ length }).map((_, idx) => {
                        const pos = idx + 1;
                        const real = session?.results?.find(r => r.position === pos);
                        const pred = session?.prediction?.find(p => p.position === pos);
                        const otherPred = otherSession?.prediction?.find(p => p.position === pos);
                        const { isMatch, points } = calcPrediction(session, idx, pred, real);
                        const otherCalc = calcPrediction(otherSession, idx, otherPred, real);
                        const predWrong = !!(pred && real && !isMatch);
                        const otherWrong = !!(otherPred && real && !otherCalc.isMatch);

                        return (
                            <div key={pos} className="table-row">
                                <div className="col-pos">{pos}</div>
                                <div className="col-real"><DriverCell item={real} /></div>
                                <div className={`col-pred ${predWrong ? 'cell-wrong' : ''}`}>
                                    <DriverCell item={pred} />
                                </div>
                                <div className={`col-points ${isMatch ? 'match' : (pred && real ? 'mismatch' : '')}`}>
                                    {isMatch ? points : (pred && real ? 0 : '-')}
                                </div>
                                <div className={`col-other-pred ${otherWrong ? 'cell-wrong' : ''}`}>
                                    <DriverCell item={otherPred} />
                                </div>
                                <div className={`col-points ${otherCalc.isMatch ? 'match' : (otherPred && real ? 'mismatch' : '')}`}>
                                    {otherCalc.isMatch ? otherCalc.points : (otherPred && real ? 0 : '-')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            </div>
        );
    }

    return (
        <div className="prediction-comparison-table">
            <div className="table-header">
                <div className="col-pos">Pos</div>
                <div className="col-pred">Tu predicción</div>
                <div className="col-real">Resultado real</div>
                <div className="col-points">Puntos</div>
            </div>
            <div className="table-body">
                {Array.from({ length }).map((_, idx) => {
                    const pos = idx + 1;
                    const pred = session?.prediction?.find(p => p.position === pos);
                    const real = session?.results?.find(r => r.position === pos);
                    const { isMatch, points } = calcPrediction(session, idx, pred, real);

                    return (
                        <div key={pos} className={`table-row ${pred && !isMatch && real ? 'no-match' : ''}`}>
                            <div className="col-pos">{pos}</div>
                            <div className="col-pred"><DriverCell item={pred} /></div>
                            <div className="col-real"><DriverCell item={real} /></div>
                            <div className={`col-points ${isMatch ? 'match' : (pred && real ? 'mismatch' : '')}`}>
                                {isMatch ? points : (pred && real ? 0 : '-')}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PredictionComparisonTable;
