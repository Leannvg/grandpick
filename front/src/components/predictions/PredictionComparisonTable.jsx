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
 * Piloto para el modo comparación (ficha oscura, `cmp-*`): nombre completo
 * en desktop, trigrama en el bottom-sheet mobile — lo decide el CSS según
 * el contenedor (`.gp-modal-card` vs `.gp-compare-drawer`), no JS, por eso
 * siempre renderiza las dos variantes.
 */
function CompareDriverCell({ item, wrong = false }) {
    if (!item) return <div className="cmp-driver">-</div>;
    const first = item.driver.full_name.split(' ')[0];
    const last = item.driver.full_name.split(' ').slice(1).join(' ');
    return (
        <div className={`cmp-driver ${wrong ? 'is-wrong' : ''}`}>
            <span className="bar" style={{ backgroundColor: item.driver.team_info?.color || '#ccc' }}></span>
            <span className="name name-full">{first} <strong>{last}</strong></span>
            <span className="name name-tri">{item.driver.trigram || first}</span>
        </div>
    );
}

function CompareMiniPts({ pts }) {
    if (pts === null) return <span className="cmp-mini-pts empty">-</span>;
    return <span className={`cmp-mini-pts ${pts > 0 ? 'match' : 'mismatch'}`}>{pts}</span>;
}

/**
 * Tabla de comparación predicción vs. resultado real, reutilizada en
 * PredictionHistory ("Mi Historial") y en el modal de comparación entre
 * dos usuarios (FloatingPredictionCompare).
 *
 * - Sin `otherSession`: 4 columnas (comportamiento original, sin cambios):
 *   Pos | Tu predicción | Resultado real | Puntos.
 * - Con `otherSession` + `otherLabel`: ficha oscura de 4 columnas (Pos |
 *   Resultado real | {myLabel} | {otherLabel}), con los puntos de cada
 *   predicción como píldora pegada al nombre del piloto pronosticado (no
 *   una columna de puntos aparte) y el total de puntos de la sesión de
 *   cada usuario junto a su nombre en el encabezado. Cada predicción
 *   errada marca de rojo toda su celda (piloto + píldora), no la fila
 *   completa, para no confundir cuando un usuario acierta y el otro no.
 */
function PredictionComparisonTable({ session, otherSession = null, otherLabel = null, myLabel = "Vos" }) {
    const length = session?.points_system?.points?.length || 10;
    const compareMode = !!otherSession;

    if (compareMode) {
        // Siempre 10 filas (la cantidad que tiene Race, la sesión con más
        // posiciones), sin importar cuántas tenga la sesión elegida: así la
        // tabla mide siempre lo mismo y no se achica/agranda cada vez que
        // se cambia de pestaña (Qualy tiene 3, Sprint 8). Las posiciones
        // que no existen en esa sesión quedan en blanco ("-"), ya las
        // maneja `CompareDriverCell`/`CompareMiniPts` cuando no hay dato.
        const rows = Array.from({ length: 10 }).map((_, idx) => {
            const pos = idx + 1;
            const real = session?.results?.find(r => r.position === pos);
            const pred = session?.prediction?.find(p => p.position === pos);
            const otherPred = otherSession?.prediction?.find(p => p.position === pos);
            const { isMatch, points } = calcPrediction(session, idx, pred, real);
            const otherCalc = calcPrediction(otherSession, idx, otherPred, real);

            return {
                pos,
                real,
                pred,
                otherPred,
                predWrong: !!(pred && real && !isMatch),
                otherWrong: !!(otherPred && real && !otherCalc.isMatch),
                myPts: (pred && real) ? (isMatch ? points : 0) : null,
                otherPts: (otherPred && real) ? (otherCalc.isMatch ? otherCalc.points : 0) : null,
            };
        });

        const myTotal = rows.reduce((sum, r) => sum + (r.myPts || 0), 0);
        const otherTotal = rows.reduce((sum, r) => sum + (r.otherPts || 0), 0);

        return (
            <div className="cmp-table-scroll">
                <div className="cmp-table is-compact">
                    <div className="cmp-head is-compact">
                        <div className="cmp-pos">#</div>
                        <div className="cmp-real-cell">Real</div>
                        <div className="cmp-head__name cmp-head__name--me">
                            <span className="cmp-head__name-label">{myLabel}</span>
                            <span className="cmp-total-pill">{myTotal} PTS</span>
                        </div>
                        <div className="cmp-head__name">
                            <span className="cmp-head__name-label">{otherLabel}</span>
                            <span className="cmp-total-pill">{otherTotal} PTS</span>
                        </div>
                    </div>
                    {rows.map(r => (
                        <div key={r.pos} className="cmp-row is-compact">
                            <div className="cmp-pos">{r.pos}</div>
                            <div className="cmp-real-cell"><CompareDriverCell item={r.real} /></div>
                            <div className={`cmp-cell-pred ${r.predWrong ? 'is-wrong' : ''}`}>
                                <CompareDriverCell item={r.pred} wrong={r.predWrong} />
                                <CompareMiniPts pts={r.myPts} />
                            </div>
                            <div className={`cmp-cell-pred ${r.otherWrong ? 'is-wrong' : ''}`}>
                                <CompareDriverCell item={r.otherPred} wrong={r.otherWrong} />
                                <CompareMiniPts pts={r.otherPts} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="prediction-comparison-table">
            <div className="table-header">
                <div className="col-pos">#</div>
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
