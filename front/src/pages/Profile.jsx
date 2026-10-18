import { useEffect, useMemo, useRef, useState } from "react";
import { useLoader } from "../context/LoaderContext";
import { Link } from "react-router-dom";
import UsersServices from "../services/users.services.js";
import RacesServices from "../services/races.services.js";
import FloatingEditProfile from "../components/FloatingEditProfile.jsx";
import FloatingChangePassword from "../components/FloatingChangePassword.jsx";
import { getImageUrl } from "../utils/cloudinary.js";
import CountryDisplay from "../components/CountryDisplay.jsx";
import "../assets/styles/profile.css";

import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const RING_COLORS = ["#E6E6E6", "#FFCD56", "#D40000"]; // qualy, sprint, race
const SESSION_TYPES = [
  { key: "qualifying", label: "Qualy", icon: "bi-stopwatch" },
  { key: "sprint", label: "Sprint", icon: "bi-lightning-charge" },
  { key: "race", label: "Carrera", icon: "bi-flag" },
];

// Posición de un documento en Mongo: los primeros 4 bytes del _id son la fecha de alta.
function memberSince(id) {
  if (!id || id.length < 8) return null;
  const seconds = parseInt(String(id).substring(0, 8), 16);
  if (!seconds) return null;
  return new Intl.DateTimeFormat("es-AR", { month: "short", year: "numeric" }).format(new Date(seconds * 1000));
}

function trigramFrom(lastName) {
  const clean = (lastName || "").replace(/\s+/g, "");
  return clean.slice(0, 3).toUpperCase() || "---";
}

// "Gran Premio de Australia" -> "Australia". Sin esto, los nombres largos empujan el resto
// de la fila a una segunda línea en mobile (las filas por GP y el eje del gráfico).
function shortGpName(name) {
  return (name || "").replace(/^Gran Premio( de)?\s*/i, "");
}

function pct(n, total) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

// Desplazamiento suave hacia el desplegable recién abierto, calculado con la altura final del
// contenido (misma animación que el panel de horarios del calendario).
function scrollFoldIntoView(foldEl, headEl, bodyEl) {
  if (!foldEl || !headEl || !bodyEl) return;
  const top = foldEl.getBoundingClientRect().top + window.scrollY;
  const needed = headEl.offsetHeight + bodyEl.scrollHeight + 16;
  const fitsBottom = top + needed - window.innerHeight + 16;
  const target = needed <= window.innerHeight ? fitsBottom : top - 16;
  if (target <= window.scrollY) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, target);
    return;
  }
  const from = window.scrollY;
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / 400, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    window.scrollTo(0, from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function GpFold({ foldKey, icon, iconColor, title, subtitle, isOpen, onToggle, rows, renderRow }) {
  const foldRef = useRef(null);
  const headRef = useRef(null);
  const bodyRef = useRef(null);

  const handleClick = () => {
    const opening = !isOpen;
    onToggle(opening ? foldKey : null);
    if (opening) {
      // Si había otro desplegable abierto, se cierra al mismo tiempo que este se abre.
      // Medir de una lo apuntaba a una posición que todavía iba a cambiar cuando el otro
      // terminara de colapsar — se espera a que las dos transiciones (0.4s) terminen.
      setTimeout(() => scrollFoldIntoView(foldRef.current, headRef.current, bodyRef.current), 420);
    }
  };

  return (
    <div className="fold" data-open={isOpen ? "true" : undefined} ref={foldRef}>
      <button
        className="fold-head"
        type="button"
        aria-expanded={isOpen}
        onClick={handleClick}
        ref={headRef}
      >
        <i className={`bi ${icon}`} style={{ color: iconColor }}></i>
        {title}
        <span className="sub">{subtitle}</span>
        <i className="bi bi-chevron-down"></i>
      </button>
      <div className="fold-wrap">
        <div className="fold-body" ref={bodyRef}>
          <div className="gp-list">
            {rows.map((row, i) => renderRow(row, i))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const [usuario, setUsuario] = useState({});
  const [races, setRaces] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [openFold, setOpenFold] = useState(null);
  const [navHeight, setNavHeight] = useState(96);

  // El nav no tiene un alto fijo en el CSS (.site-header es sticky, no fixed, sin
  // altura declarada), así que se mide en vivo en vez de adivinar un número.
  useEffect(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const update = () => setNavHeight(header.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (usuario?.img_user) setCurrentImage(usuario.img_user);
  }, [usuario]);

  const imageUrl = getImageUrl(currentImage, 800, "profile");

  const fetchUsuario = async () => {
    showLoader();
    try {
      const perfil = await UsersServices.getUserProfile();
      const [stats, racesData] = await Promise.all([
        UsersServices.getUserStats(perfil._id),
        RacesServices.findAllByYear(new Date().getFullYear()),
      ]);
      setUsuario(stats);
      setRaces(racesData || []);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  // Un Gran Premio por circuito, en orden de calendario (mismo criterio de agrupación que Calendar.jsx)
  const gpList = useMemo(() => {
    const map = new Map();
    races.forEach((r) => {
      const circuitId = String(r.id_circuit?._id || r.id_circuit || r.circuit?._id || "");
      if (!circuitId || map.has(circuitId)) return;
      map.set(circuitId, {
        circuitId,
        name: r.circuit?.gp_name || r.circuit?.circuit_name || "Gran Premio",
        country: r.circuit?.country,
        dateStart: r.date_gp_start,
      });
    });
    return Array.from(map.values()).sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart));
  }, [races]);

  const stats = usuario.stats || {};

  const sessionsByCircuit = useMemo(() => {
    const map = {};
    (stats.sessionRanking || []).forEach((entry) => {
      if (!entry.circuitId) return;
      if (!map[entry.circuitId]) map[entry.circuitId] = {};
      map[entry.circuitId][entry.type] = entry;
    });
    return map;
  }, [stats.sessionRanking]);

  const ringData = (type) => {
    const d = stats[type] || {};
    return {
      datasets: [{
        data: [d.qualifying || 0, d.sprint || 0, d.race || 0],
        backgroundColor: RING_COLORS,
        borderWidth: 0,
        cutout: "70%",
      }],
    };
  };
  const ringOptions = {
    maintainAspectRatio: false,
    animation: { duration: 500 },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  const bestPos = stats.ranking?.bestPosition;
  const bestPosCircuit = bestPos ? gpList.find((g) => g.circuitId === bestPos.circuitId) : null;
  const bestSessionCircuit = stats.bestSession ? gpList.find((g) => g.circuitId === stats.bestSession.circuitId) : null;

  const podiumAttempts = (stats.predictions?.race || 0) + (stats.predictions?.sprint || 0);
  const poleAttempts = stats.predictions?.qualifying || 0;
  // Se divide por posiciones predichas (sprint = 8, carrera = 10), no por sesiones:
  // dividir por sesiones da porcentajes imposibles (>100%).
  const sprintAccuracy = pct(stats.successes?.sprint, stats.positionsPredicted?.sprint);
  const raceAccuracy = pct(stats.successes?.race, stats.positionsPredicted?.race);
  const podiumAccuracy = podiumAttempts > 0 ? Math.round(((stats.podiums?.total || 0) / (podiumAttempts * 3)) * 100) : 0;
  const poleAccuracy = pct(stats.poles?.total, poleAttempts);

  // Evolución en la temporada: puntos y posición (carrera) por GP, en el mismo orden que el calendario
  const evoLabels = gpList.map((g) => shortGpName(g.name));
  const evoPoints = gpList.map((g) => stats.pointsByCircuit?.[g.circuitId] ?? 0);
  const evoPos = gpList.map((g) => sessionsByCircuit[g.circuitId]?.race?.rank ?? null);
  const playedPos = evoPos.filter((v) => v !== null);
  const totalPlayers = stats.ranking?.total || 1;
  const posMax = playedPos.length ? Math.min(totalPlayers, Math.max(...playedPos) + 2) : totalPlayers;

  return (
    <div className="fp-page" style={{ "--fp-nav-h": `${navHeight}px` }}>
      <header className="page-head">
        <p className="section-label">Tu garaje digital</p>
        <h1 className="section-title">Ficha de <strong>piloto</strong></h1>
        <p className="section-subtitle">Seguimiento de predicciones y resultados · Temporada {new Date().getFullYear()}</p>
      </header>

      <aside className="identity panel" aria-label="Identidad">
        <div className="avatar-box"><img src={imageUrl} alt="Foto de perfil" /></div>
        {stats.ranking?.position ? (
          <span className="rank-chip"><i className="bi bi-trophy-fill"></i> {stats.ranking.position}.º en el ranking</span>
        ) : null}
        <h2 className="name">{(usuario.name || "Piloto")} <strong>{usuario.last_name || ""}</strong></h2>
        <span className="trigram">{trigramFrom(usuario.last_name).split("").join(" ")}</span>
        <div className="meta">
          <div className="meta-row"><CountryDisplay iso2={usuario.country} /></div>
          <div className="meta-row"><i className="bi bi-envelope"></i> {usuario.email}</div>
          {memberSince(usuario._id) ? <div className="meta-row"><i className="bi bi-calendar-check"></i> Miembro desde {memberSince(usuario._id)}</div> : null}
        </div>
        <nav className="actions" aria-label="Acciones de la cuenta">
          <button className="action primary" type="button" onClick={() => setShowProfileModal(true)}>
            <i className="bi bi-pencil-square"></i> Editar perfil
          </button>
          <Link to="/prediction-history" className="action text-decoration-none">
            <i className="bi bi-clock-history"></i> Mi historial
          </Link>
          <button className="action" type="button" onClick={() => setShowPasswordModal(true)}>
            <i className="bi bi-key"></i> Cambiar contraseña
          </button>
        </nav>
      </aside>

      <main className="stats">
        <section className="panel">
          <div className="panel__head">
            <h2><i className="bi bi-speedometer2"></i> Rendimiento</h2>
            <div className="panel__legend">
              <span><i className="dot" style={{ background: "var(--qualy)" }}></i>Qualy</span>
              <span><i className="dot" style={{ background: "var(--sprint)" }}></i>Sprint</span>
              <span><i className="dot" style={{ background: "var(--race)" }}></i>Race</span>
            </div>
          </div>
          <div className="rings">
            {[
              { key: "predictions", label: "Predicciones" },
              { key: "successes", label: "Aciertos" },
              { key: "points", label: "Puntos" },
            ].map(({ key, label }) => (
              <div className="ring-col" key={key}>
                <div className="ring">
                  <div className="canvas-box"><Doughnut data={ringData(key)} options={ringOptions} /></div>
                  <div className="center"><span className="t">{label}</span><span className="v">{stats[key]?.total || 0}</span></div>
                </div>
                <div className="breakdown">
                  {["qualifying", "sprint", "race"].map((t, i) => (
                    <div className="bd-row" key={t}>
                      <span className="dot" style={{ background: RING_COLORS[i] }}></span>
                      <span className="k">{t === "qualifying" ? "Qualy" : t === "sprint" ? "Sprint" : "Race"}</span>
                      <span className="n">{stats[key]?.[t] || 0}</span>
                      <span className="p">{pct(stats[key]?.[t] || 0, stats[key]?.total)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel__head"><h2><i className="bi bi-list-stars"></i> Resumen</h2></div>
          <div className="status-bar">
            <div className="status-item">
              <div className="t"><i className="bi bi-bullseye"></i> Acierto de podio</div>
              <div className="v">{podiumAccuracy}%</div>
              <div className="s">{stats.podiums?.total || 0} de {podiumAttempts * 3} pronósticos</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-stopwatch"></i> Acierto de pole</div>
              <div className="v">{poleAccuracy}%</div>
              <div className="s">{stats.poles?.total || 0} de {poleAttempts} pronósticos</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-speedometer2"></i> Acierto en sprint</div>
              <div className="v">{sprintAccuracy}%</div>
              <div className="s">vs. {raceAccuracy}% en carrera</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-person-lines-fill"></i> Piloto más predicho</div>
              <div className="v">{stats.mostPredictedDriver?.trigram || "—"}</div>
              <div className="s">{stats.mostPredictedDriver ? `${stats.mostPredictedDriver.count} veces en tus pronósticos` : "todavía sin datos"}</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-star-fill"></i> Mayor cantidad de aciertos por sesión</div>
              <div className="v">{stats.bestSession?.successes ?? "—"}</div>
              <div className="s">{bestSessionCircuit ? `${shortGpName(bestSessionCircuit.name)} · ${stats.bestSession.type === "race" ? "carrera" : stats.bestSession.type === "sprint" ? "sprint" : "qualy"}` : "todavía sin datos"}</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-snow"></i> Racha de fallos</div>
              <div className="v">{stats.failStreak || 0}</div>
              <div className="s">máxima racha de la temporada sin aciertos</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-people"></i> Equipo más acertado</div>
              <div className="v">{stats.mostAccurateTeam?.name || "—"}</div>
              <div className="s">{stats.mostAccurateTeam ? `${stats.mostAccurateTeam.count} aciertos de sus pilotos` : "todavía sin datos"}</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-graph-up-arrow"></i> Mejor posición</div>
              <div className="v">{bestPos ? `#${bestPos.rank}` : "—"}</div>
              <div className="s">{bestPosCircuit ? `en ${shortGpName(bestPosCircuit.name)} · ${bestPos.type === "race" ? "carrera" : bestPos.type === "sprint" ? "sprint" : "qualy"}` : "todavía sin datos"}</div>
            </div>
            <div className="status-item">
              <div className="t"><i className="bi bi-exclamation-triangle"></i> Puntos perdidos</div>
              <div className="v">{stats.pointsLost?.total ?? 0}</div>
              <div className="s">por errores y sesiones sin predicción</div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head"><h2><i className="bi bi-graph-up"></i> Evolución en la temporada</h2></div>
          <div className="evo-row">
            <div className="evo-col">
              <div className="legend-line"><i className="dot" style={{ background: "var(--sprint)" }}></i> Puntos por GP</div>
              <div className="evo-chart-wrap">
                <Bar
                  data={{ labels: evoLabels, datasets: [{ data: evoPoints, backgroundColor: "#FFCD56", borderRadius: 2 }] }}
                  options={{
                    maintainAspectRatio: false,
                    animation: { duration: 500 },
                    layout: { padding: { top: 10, bottom: 2 } },
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: "#c5d2dd", maxRotation: 60, minRotation: 60, font: { size: 10 } }, grid: { display: false } },
                      y: { beginAtZero: true, ticks: { color: "#c5d2dd" }, grid: { color: "rgba(255,255,255,.07)" } },
                    },
                  }}
                />
              </div>
            </div>
            <div className="evo-col">
              <div className="legend-line"><span className="line-swatch"></span> Posición en el ranking (carrera, de {totalPlayers})</div>
              <div className="evo-chart-wrap">
                <Line
                  data={{
                    labels: evoLabels,
                    datasets: [{
                      data: evoPos, borderColor: "#fff", backgroundColor: "#fff", pointRadius: 3, pointHoverRadius: 5,
                      borderWidth: 2, tension: 0.3, spanGaps: true,
                    }],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    animation: { duration: 500 },
                    layout: { padding: { top: 10, bottom: 2 } },
                    plugins: {
                      legend: { display: false },
                      tooltip: { callbacks: { label: (ctx) => `P${ctx.parsed.y} de ${totalPlayers}` } },
                    },
                    scales: {
                      x: { ticks: { color: "#c5d2dd", maxRotation: 60, minRotation: 60, font: { size: 10 } }, grid: { display: false } },
                      y: { reverse: true, min: 1, max: posMax, ticks: { color: "#c5d2dd", stepSize: 1 }, grid: { color: "rgba(255,255,255,.07)" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head"><h2><i className="bi bi-geo-alt"></i> Por Gran Premio</h2></div>
          <div className="fold-group">
            <GpFold
              foldKey="position"
              icon="bi-trophy"
              iconColor="var(--sprint)"
              title="Posición final"
              subtitle={`entre ${totalPlayers} usuarios, por sesión`}
              isOpen={openFold === "position"}
              onToggle={setOpenFold}
              rows={gpList}
              renderRow={(gp, i) => (
                <div className="gp-row" style={{ "--i": i }} key={gp.circuitId}>
                  <div className="gp-row__name"><CountryDisplay iso2={gp.country} showName={false} /> {shortGpName(gp.name)}</div>
                  <div className="gp-row__sessions">
                    {SESSION_TYPES.map((s) => {
                      const entry = sessionsByCircuit[gp.circuitId]?.[s.key];
                      return (
                        <div className={`sess ${entry ? (entry.rank <= 3 ? "top" : "") : "pending"}`} key={s.key}>
                          <i className={`bi ${s.icon}`}></i>{s.label}<b>{entry ? `P${entry.rank}` : "—"}</b>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            />
            <GpFold
              foldKey="hits"
              icon="bi-check2-circle"
              iconColor="#6fd38a"
              title="Aciertos totales"
              subtitle="posiciones acertadas, por GP"
              isOpen={openFold === "hits"}
              onToggle={setOpenFold}
              rows={gpList}
              renderRow={(gp, i) => {
                const hits = stats.hitsByCircuit?.[gp.circuitId];
                const points = stats.pointsByCircuit?.[gp.circuitId];
                const pending = hits === undefined;
                return (
                  <div className="gp-row" style={{ "--i": i }} key={gp.circuitId}>
                    <div className="gp-row__name"><CountryDisplay iso2={gp.country} showName={false} /> {shortGpName(gp.name)}</div>
                    <div className="gp-row__totals">
                      <span className="tot">
                        {!pending && <span className="tot__n">{hits}</span>}
                        {!pending && <span className="tot__label">aciertos</span>}
                        <span className={`tot__pts ${pending ? "pending" : ""}`}>
                          {pending ? "—" : <><i className="bi bi-star-fill"></i>+{points || 0} pts</>}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </section>
      </main>

      <FloatingEditProfile
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        usuario={usuario}
        onUpdated={fetchUsuario}
      />
      <FloatingChangePassword
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        usuario={usuario}
        onUpdated={fetchUsuario}
      />
    </div>
  );
}

export default Profile;
