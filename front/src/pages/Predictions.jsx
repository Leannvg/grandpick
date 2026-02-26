import { useEffect, useState, useRef, useCallback } from "react";
import DriversServices from "../services/drivers.services";
import RacesServices from "../services/races.services";
import PredictionServices from "../services/predictions.services";
import UsersServices from "../services/users.services.js";
import * as countriesServices from "../services/countries.services.js";
import SearchableSelect from "./../components/SearchableSelect.jsx";
import CountdownToRace from "../components/countdown/CountdownToRace.jsx";
import CountdownToOpen from "../components/countdown/CountdownToOpen.jsx";
import { useAlert } from "./../context/AlertContext.jsx";
import { useDialog } from "./../context/DialogContext.jsx";
import { useLoader } from './../context/LoaderContext.jsx';
import { computeRaceState, formatRaceDate } from "../utils/helpers.js";
import crystalBallIcon from "../assets/icons/crystal_ball.png";
import "../assets/styles/predictions.css";

function Predictions() {
  const [drivers, setDrivers] = useState([]);
  const [race, setRace] = useState(null);
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

  const fetchRace = useCallback(async () => {
    try {
      const newRace = await RacesServices.findCurrentOrNext();
      if (!newRace) {
        setRace(null);
        return null;
      }

      const country = await getCountry(newRace.circuit.country);
      newRace.raceCountry = country;

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

  async function getCountry(iso2) {
    let country = await countriesServices.getOneCountry(iso2);
    return country;
  }

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
      title: "¿Deseas cargar la siguiente predicción?",
      message: `Estás por predecir el resultado del GP de ${race.circuit.gp_name}`,
      confirmText: "Predecir",
      cancelText: "Cancelar",
      confirmVariant: "success",
    };
    const confirmed = await confirmDialog(dialog);
    if (!confirmed) return;

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
      showAlert("Predicción cargada con éxito ✅", "success");
    } catch (error) {
      console.error("Error al procesar predicción:", error);
      showAlert(
        "Hubo un error al guardar tu predicción. Intentá nuevamente.",
        "danger",
        true
      );
    }
  }

  return (
    <section className="predictions-page">
      {race && (
        <div className="predictions-header">
          <div className="mb-5">
            {race.raceCountry && (
              <div className="predictions-country">
                <span className="emoji-flag">{race.raceCountry.emoji}</span>
                {race.raceCountry.name}
              </div>
            )}
            <h1 className="predictions-gp-name">{race.circuit.gp_name}</h1>
            {race.raceCountry && (
              <span className="section-subtitle">{formatRaceDate(race.date_gp_start, race.date_gp_end)}</span>
            )}
          </div>



          <span className="qualy-label">QUALY</span>

          {!isPreWindow && (canPredict || (race && new Date(race.date_race).getTime() + race.totalDuration > Date.now())) && (
            <div className="predictions-countdown">
              <span className="countdown-label">Tiempo restante para predecir:</span>
              <CountdownToRace
                raceDate={race.date_race}
                totalDuration={race.totalDuration}
                onExpire={handleExpire}
                onStartRace={handleStartRace}
              />
            </div>
          )}

          <div className="prediction-status-container">
            {currentPrediction ? (
              <div className="prediction-status-banner status-saved">
                <span>✅ Tu predicción ya está guardada, pero podes editarla antes de que el contador llegue a 0.</span>
              </div>
            ) : (
              <div className="prediction-status-banner status-missing">
                <span>💡 Todavía no realizaste tu predicción.</span>
              </div>
            )}
          </div>

          {!canPredict && timeToOpen !== null && (
            <div className="mt-4">
              <CountdownToOpen
                timeToOpen={timeToOpen}
                onOpen={() => setCanPredict(true)}
              />
              <p className="info-message">
                Las predicciones se habilitarán próximamente. <br />
                ¡Vuelve pronto para cargar tu equipo!
              </p>
            </div>
          )}
        </div>
      )}

      {race === null && (
        <div className="info-message">
          📭 No hay próximas carreras para predecir en este momento. <br />
          ¡Mantente atento a las próximas fechas!
        </div>
      )}

      {race && !isPreWindow && (
        <div className="prediction-cards-container">
          {pointSystem.map((point, index) => {
            const driverId = predictions[index];

            return (
              <div
                key={index}
                className={`prediction-card ${invalidIndexes.includes(index) ? "is-invalid" : ""}`}
              >
                <div className="prediction-rank">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="prediction-select-wrapper">
                  <SearchableSelect
                    value={driverId || ""}
                    onChange={(selected) => handleChange(index, selected?.value || "")}
                    isDisabled={isClosed}
                    options={drivers.map((d) => ({
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
      )}

      {isClosed && !canPredict && race && (
        <div className="info-message text-danger mt-4">
          ⚠️ Las predicciones están cerradas para esta sesión.
        </div>
      )}
    </section>
  );
}

export default Predictions;
