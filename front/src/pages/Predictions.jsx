import { useEffect, useState, useRef, useCallback } from "react";
import DriversServices from "../services/drivers.services";
import RacesServices from "../services/races.services";
import PredictionServices from "../services/predictions.services";
import UsersServices from "../services/users.services.js";
import SearchableSelect from "./../components/SearchableSelect.jsx";
import CountdownToRace from "../components/countdown/CountdownToRace.jsx";
import CountdownToOpen from "../components/countdown/CountdownToOpen.jsx";
import { useAlert } from "./../context/AlertContext.jsx";
import { useDialog } from "./../context/DialogContext.jsx";
import { useLoader } from './../context/LoaderContext.jsx';
import { computeRaceState } from "../utils/helpers.js";
import crystalBallIcon from "../assets/icons/crystal_ball.png";
import { onSocketReady } from "../socket.js";
import "../assets/styles/predictions.css";

function Predictions() {
  const [drivers, setDrivers] = useState([]);
  const [race, setRace] = useState(null);
  // Pedido: "al presionar rápido logré agarrar lo que aparece antes de
  // aparecer el loader" — "race === null" por sí solo no distingue
  // "todavía no se consultó" de "se consultó y no hay carrera" (los dos
  // casos arrancan en null). showLoader() recién pone loading=true en un
  // useEffect, DESPUÉS del primer render — en ese primer frame race sigue
  // siendo null (su valor inicial) y loading todavía es false, así que el
  // mensaje "No hay próximas carreras..." se ve un instante antes de que
  // tape todo el loader. raceChecked solo pasa a true cuando fetchRace()
  // ya resolvió (haya o no carrera), para esperar ese resultado real en
  // vez de guiarse por el estado inicial.
  const [raceChecked, setRaceChecked] = useState(false);
  const [pointSystem, setPointSystem] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [invalidIndexes, setInvalidIndexes] = useState([]);
  const [user, setUser] = useState({});
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();
  const [canPredict, setCanPredict] = useState(false);
  const [isPreWindow, setIsPreWindow] = useState(false);
  const [timeToOpen, setTimeToOpen] = useState(null);
  const { showLoader, hideLoader } = useLoader();
  const prevRaceIdRef = useRef(null);

  const isFormComplete =
    predictions.length === pointSystem.length &&
    predictions.every(p => p !== "");

  const fetchRace = useCallback(async () => {
    try {
      const newRace = await RacesServices.findCurrentOrNext();
      if (!newRace) {
        setRace(null);
        return null;
      }

      setRace(newRace);
      setPointSystem(newRace.points_system.points);

      const { isClosed, canPredict, isPreWindow, timeToOpen } = computeRaceState(newRace);

      setIsClosed(isClosed);
      setCanPredict(canPredict);
      setIsPreWindow(isPreWindow);
      setTimeToOpen(timeToOpen);

      return newRace;

    } catch (err) {
      console.error("Error en fetchRace:", err);
      setRace(null);
      return null;
    } finally {
      setRaceChecked(true);
    }
  }, []);

  const fetchRaceWithLoader = useCallback(async () => {
    showLoader();
    try {
      const race = await fetchRace();
      return race;
    } finally {
      hideLoader();
    }
  }, [fetchRace, showLoader, hideLoader]);

  async function updateCurrentPrediction(user, race) {
    PredictionServices.findPredictionByUserAndRace(user._id, race._id)
      .then((response) => {
        setCurrentPrediction(response);
      })
      .catch((error) => {
        if (error.message?.includes("No existe predicción")) {
          setCurrentPrediction(null);
        }
      });
  }

  useEffect(() => {
    async function loadInitialData() {
      showLoader();
      try {
        await Promise.all([
          UsersServices.getUserProfile().then(setUser),
          DriversServices.findAll().then(setDrivers),
          fetchRace(),
        ]);
      } finally {
        hideLoader();
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    let currentSocket = null;
    const cleanup = onSocketReady((socket) => {
      currentSocket = socket;
      socket.on("races:updated", fetchRace);
    });

    return () => {
      if (cleanup) cleanup();
      if (currentSocket) {
        currentSocket.off("races:updated", fetchRace);
      }
    };
  }, [fetchRace]);

  useEffect(() => {
    if (currentPrediction && currentPrediction.prediction) {
      const filledPredictions = currentPrediction.prediction
        .sort((a, b) => a.position - b.position)
        .map((p) => p.driver);

      setPredictions(filledPredictions);
    }
  }, [currentPrediction]);

  useEffect(() => {
    if (!race?._id || !user?._id) return;

    if (prevRaceIdRef.current !== race._id) {
      prevRaceIdRef.current = race._id;
      setPredictions([]);
      setInvalidIndexes([]);
      setCurrentPrediction(null);
    }

    updateCurrentPrediction(user, race);
  }, [race?._id, user?._id]);

  function handleChange(index, value) {
    const updated = [...predictions];
    const invalids = [...invalidIndexes];

    const existingIndex = updated.findIndex((id, i) => id === value && i !== index);
    if (existingIndex !== -1) {
      updated[existingIndex] = "";
      if (!invalids.includes(existingIndex)) {
        invalids.push(existingIndex);
      }
    }

    updated[index] = value;
    const cleanInvalids = invalids.filter((i) => i !== index && updated[i] === "");

    setPredictions(updated);
    setInvalidIndexes(cleanInvalids);
  }

  const handleStartRace = useCallback(async () => {
    setIsClosed(true);
    setCanPredict(false);
    await new Promise(r => setTimeout(r, 200));
    await fetchRaceWithLoader();
  }, [fetchRaceWithLoader]);

  const handleExpire = useCallback(async () => {
    setIsClosed(true);
    setCanPredict(false);
    await new Promise(r => setTimeout(r, 200));
    const result = await fetchRaceWithLoader();

    if (!result) {
      setPredictions([]);
      setInvalidIndexes([]);
      setCurrentPrediction(null);
      setIsClosed(false);
      setCanPredict(false);
    }
  }, [fetchRaceWithLoader]);

  async function onSubmit(event) {
    if (event) event.preventDefault();

    if (!isFormComplete) {
      showAlert(
        "Tenés que completar todas las posiciones antes de enviar tu predicción.",
        "danger",
        true
      );
      return;
    }

    const dialog = {
      title: "¿Deseás cargar la siguiente predicción?",
      message: `Estás por predecir el resultado del GP de ${race.circuit.gp_name}`,
      confirmText: "Predecir",
      cancelText: "Cancelar",
      confirmVariant: "success",
    };
    const confirmed = await confirmDialog(dialog);
    if (!confirmed) return;

    showLoader("Cargando...");
    try {
      const predictionPayload = predictions.map((driverId, index) => ({
        position: index + 1,
        driver: driverId,
      }));

      const payload = {
        prediction: predictionPayload,
        user_id: user._id,
        race_id: race._id,
      };

      if (currentPrediction) {
        await PredictionServices.editPrediction(payload, currentPrediction._id);
      } else {
        await PredictionServices.createPrediction(payload);
      }

      await updateCurrentPrediction(user, race);
      showAlert("Predicción cargada con éxito", "success");
    } catch (error) {
      console.error("Error al procesar predicción:", error);
      showAlert(
        "Hubo un error al guardar tu predicción. Intentá nuevamente.",
        "danger",
        true
      );
    } finally {
      hideLoader();
    }
  }

  return (
    <div className="predictions-page page-wrapper">
      {/* El encabezado (país/título/fecha/tag + contador + estado de la
          predicción) ya no vive acá: lo muestra GpHeroBanner
          variant="predictions" (montado en App.jsx, fuera de este
          componente, mismo lugar donde antes se montaba NextRaceCTA — ver
          el ternario de banners ahí). Diseño aprobado primero en el
          laboratorio (GpHeroPrototype.jsx, variant="predictions"). */}
      {race && !isPreWindow && (canPredict || race.state !== "Finalizado") && (
        // CountdownToRace ya no se muestra (ese rol lo cumple el contador
        // del banner de arriba) — se deja montado pero oculto SOLO por su
        // efecto secundario: dispara handleStartRace cuando la carrera
        // arranca, para cerrar las predicciones sin esperar un evento de
        // socket. display:none en vez de borrar el componente: reusa la
        // lógica ya probada en vez de reimplementarla acá.
        <div style={{ display: "none" }} aria-hidden="true">
          <CountdownToRace
            raceDate={race.date_race}
            totalDuration={race.totalDuration}
            onExpire={handleExpire}
            onStartRace={handleStartRace}
          />
        </div>
      )}

      {race && isPreWindow && timeToOpen !== null && (
        // Pedido: "el cartel de las predicciones se habilitarán en X tiempo
        // aparece por debajo del banner, todos los mensajes deberían aparecer
        // junto al título" — el cartel visible para pre-ventana ahora vive en
        // GpHeroBanner variant="predictions" (junto al título, como texto
        // fijo en vez de un contador). CountdownToOpen sigue montado acá,
        // oculto, SOLO por su efecto secundario onOpen (mismo patrón que
        // CountdownToRace arriba): cuando se cumplen las 24hs, flippea
        // canPredict/isPreWindow sin esperar un refetch ni un evento de socket.
        <div style={{ display: "none" }} aria-hidden="true">
          <CountdownToOpen
            timeToOpen={timeToOpen}
            onOpen={() => {
              setCanPredict(true);
              setIsPreWindow(false);
            }}
          />
        </div>
      )}

      <section className="page-section container text-center">
        {raceChecked && race === null && (
          <div className="info-message">
            📭 No hay próximas carreras para predecir en este momento. <br />
            ¡Mantente atento a las próximas fechas!
          </div>
        )}
      </section>

      {race && !isPreWindow && (
        <div className="gp-hero-banner__predict-below">
          <div className="prediction-cards-container container">
            {pointSystem.map((point, index) => {
              const driverId = predictions[index];

              return (
                <div
                  key={index}
                  className={`prediction-card ${invalidIndexes.includes(index) ? "is-invalid" : ""} ${isClosed ? "is-disabled" : ""}`}
                >
                  <div className="prediction-rank">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="prediction-select-wrapper">
                    <SearchableSelect
                      value={driverId || ""}
                      onChange={(selected) => handleChange(index, selected?.value || "")}
                      isDisabled={isClosed}
                      options={drivers
                        .filter((d) => (d.active === true && d.role === "titular") || d._id === driverId)
                        .map((d) => ({
                          _id: d._id,
                          name: d.full_name,
                          teamName: d.team_info?.name || "",
                          color: d.team_info?.color || "#ccc"
                        }))}
                      placeholder="Seleccione un piloto"
                    />
                  </div>
                </div>
              );
            })}

            {race && !isClosed && (
              <div className="prediction-actions">
                <button
                  className="btn-submit-prediction"
                  onClick={onSubmit}
                  disabled={!isFormComplete}
                  title="Guardar predicción"
                >
                  <img src={crystalBallIcon} alt="Predecir" className="crystal-ball-icon" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isClosed && !canPredict && race && !isPreWindow && (
        <section className="page-section container text-center">
          <div className="info-message text-danger mt-4">
            ⚠️ Las predicciones están cerradas para esta sesión.
          </div>
        </section>
      )}
    </div>
  );
}

export default Predictions;
