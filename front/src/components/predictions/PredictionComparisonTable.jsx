import "../../assets/styles/predictionCompare.css";

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
 * Piloto (ficha oscura, `cmp-*`): nombre completo en desktop, trigrama en
 * mobile — lo decide el CSS según el contenedor (`.gp-modal-card`,
 * `.gp-compare-drawer`, `.history-detail`), no JS, por eso siempre
 * renderiza las dos variantes.
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

function CompareMiniPts({ pts, empty = null }) {
    if (pts === null) return empty ? <span className="cmp-points-empty">{empty}</span> : <span className="cmp-mini-pts empty">-</span>;
    return <span className={`cmp-mini-pts ${pts > 0 ? 'match' : 'mismatch'}`}>{pts}</span>;
}

/**
 * Tabla de comparación predicción vs. resultado real (ficha oscura, `cmp-*`),
 * reutilizada en PredictionHistory y en el modal de comparación entre dos
 * usuarios (FloatingPredictionCompare).
 *
 * - Sin `otherSession` (historial): 4 columnas (# | Tu predicción | Resultado
 *   real | Puntos), con los puntos de cada fila como píldora en su propia
 *   columna. `isMine` define el título de la columna de predicción: "Tu
 *   predicción" en el historial propio, "Predicción" en el de otro usuario.
 * - Con `otherSession` + `otherLabel` (comparación): 4 columnas (Pos | Real |
 *   {myLabel} | {otherLabel}), con los puntos pegados al piloto y el total de
 *   cada usuario junto a su nombre.
 *
 * Cada predicción errada marca de rojo toda su celda, no la fila completa.
 * Siempre 10 filas (las que tiene Race, la sesión con más posiciones) para que
 * la tabla mida lo mismo al cambiar de pestaña; las posiciones que no existen
 * en esa sesión quedan en blanco ("-").
 */
function PredictionComparisonTable({ session, otherSession = null, otherLabel = null, myLabel = "Vos", isMine = true }) {
    const compareMode = !!otherSession;

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
    const layout = compareMode ? "is-compact" : "is-solo";

    if (!compareMode) {
        return (
            <div className="cmp-table-scroll cmp-table-scroll--history">
                <div className="cmp-table is-solo">
                    <div className="cmp-head is-solo">
                        <div className="cmp-pos">#</div>
                        <div className="cmp-head__name cmp-head__name--me">
                            <span className="cmp-head__name-label">{isMine ? "Tu predicción" : "Predicción"}</span>
                        </div>
                        <div className="cmp-real-cell">Resultado real</div>
                        <div className="cmp-points-cell">Puntos</div>
                    </div>
                    {rows.map(r => (
                        <div key={r.pos} className="cmp-row is-solo">
                            <div className="cmp-pos">{r.pos}</div>
                            <div className={`cmp-cell-pred ${r.predWrong ? "is-wrong" : ""}`}>
                                <CompareDriverCell item={r.pred} wrong={r.predWrong} />
                            </div>
                            <div className="cmp-real-cell"><CompareDriverCell item={r.real} /></div>
                            <div className="cmp-points-cell">
                                <CompareMiniPts pts={r.myPts} empty="-" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`cmp-table-scroll ${compareMode ? "" : "cmp-table-scroll--history"}`}>
            <div className={`cmp-table ${layout}`}>
                <div className={`cmp-head ${layout}`}>
                    <div className="cmp-pos">#</div>
                    <div className="cmp-real-cell">Real</div>
                    <div className={`cmp-head__name ${isMine ? "cmp-head__name--me" : ""}`}>
                        <span className="cmp-head__name-label">{myLabel}</span>
                        <span className="cmp-total-pill">{myTotal} PTS</span>
                    </div>
                    {compareMode && (
                        <div className="cmp-head__name">
                            <span className="cmp-head__name-label">{otherLabel}</span>
                            <span className="cmp-total-pill">{otherTotal} PTS</span>
                        </div>
                    )}
                </div>
                {rows.map(r => (
                    <div key={r.pos} className={`cmp-row ${layout}`}>
                        <div className="cmp-pos">{r.pos}</div>
                        <div className="cmp-real-cell"><CompareDriverCell item={r.real} /></div>
                        <div className={`cmp-cell-pred ${r.predWrong ? "is-wrong" : ""}`}>
                            <CompareDriverCell item={r.pred} wrong={r.predWrong} />
                            <CompareMiniPts pts={r.myPts} />
                        </div>
                        {compareMode && (
                            <div className={`cmp-cell-pred ${r.otherWrong ? "is-wrong" : ""}`}>
                                <CompareDriverCell item={r.otherPred} wrong={r.otherWrong} />
                                <CompareMiniPts pts={r.otherPts} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PredictionComparisonTable;
