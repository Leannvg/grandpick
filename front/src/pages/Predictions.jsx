import { useEffect, useState, useRef, useCallback} from "react";
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
          fetchRace(),  // versión silenciosa
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
  }, [getCountry]);

  const fetchRaceWithLoader = useCallback(async () => {
    showLoader();

    try {
      const race = await fetchRace(); // usa la silenciosa
      return race;
    } finally {
      hideLoader();
    }
  }, [fetchRace, showLoader, hideLoader]);

  async function getCountry(iso2) {
    let country = await countriesServices.getOneCountry(iso2)
    return country
  }

  async function updateCurrentPrediction(user, race) {
    PredictionServices.findPredictionByUserAndRace(user._id, race._id)
      .then((response) => {
        setCurrentPrediction(response)
      })
      .catch((error) => {
        //console.error("Error al obtener prediccion:", error);

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

    console.log("🚀 handleStartRace ejecutado");

    // 🔥 Cambiar UI inmediatamente
    setIsClosed(true);
    setCanPredict(false);

    await new Promise(r => setTimeout(r, 200));
    await fetchRaceWithLoader();  // refresca si el backend ya cambió la carrera

  }, [fetchRace, showLoader, hideLoader]);

  const handleExpire = useCallback(async () => {
    console.log("⛔ handleExpire ejecutado");

    // 🔥 Cambiar UI inmediatamente
    setIsClosed(true);
    setCanPredict(false);

    await new Promise(r => setTimeout(r, 200));
    const result = await fetchRaceWithLoader();

    // Si no hay próxima carrera:
    if (!result) {
      console.log("🏁 No hay próxima carrera. Reseteando formulario.");

      setPredictions([]);
      setInvalidIndexes([]);
      setCurrentPrediction(null);

      // desbloquear selects por si acaso
      setIsClosed(false);

      // asegurarnos de que no renderice el formulario
      setCanPredict(false);
    }

  }, [fetchRaceWithLoader]);
  
  async function onSubmit(event) {
    event.preventDefault();

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
    }
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

      // Actualizar predicción en el local state
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
    <div className="container">
      <h2>Predicciones</h2>

      {/* Si terminó de cargar y no hay carrera */}
      {race === null && (
        <p className="text-info">📭 No hay próximas carreras para predecir</p>
      )}

      {race && (
        <>
          {race?.raceCountry && (
            <p>
              <span className="emoji-flag">{race.raceCountry.emoji}</span> {race.raceCountry.name}
            </p>
          )}
          <p>{race.circuit.gp_name}</p>
          <p>{formatRaceDate(race.date_gp_start, race.date_gp_end)}</p>
          <p>{race.points_system.type}</p>
          {/* Si NO está dentro del rango de predicción, mostrar contador especial */}
          {!canPredict && timeToOpen !== null && (
            <CountdownToOpen
              timeToOpen={timeToOpen}
              onOpen={() => setCanPredict(true)}
            />
          )}

          {/* Si ya está dentro de los 5 días, mostrar mensaje opcional */}
          {canPredict && !isClosed && (
            <p className="text-success">✔️ Ya podés hacer tu predicción</p>
          )}
          
        </>
      )}

    {!isPreWindow && (
      <>
      
      {/* Countdown (predicción o carrera en curso) */}
      {(canPredict || (race && new Date(race.date_race).getTime() + race.totalDuration > Date.now())) && (
        <CountdownToRace
          raceDate={race.date_race}
          totalDuration={race.totalDuration}
          onExpire={handleExpire}
          onStartRace={handleStartRace}
        />
      )}


      {/* Formulario (siempre visible excepto pre-window) */}
      {isClosed && !canPredict && (
        <p className="text-danger">
          ⚠️ Las predicciones están cerradas
        </p>
      )}

      {/* Mostrar el formulario solo cuando ya se pueda predecir */}
      {race && (
      <form onSubmit={onSubmit}>
        {pointSystem.map((point, index) => (
          <div className="mb-3" key={index}>
            <label>{index + 1}</label>
            <div
                className={`react-select-container mb-3 ${
                  invalidIndexes.includes(index) ? "is-invalid" : ""
                }`}
              >



              <SearchableSelect
                value={predictions[index] || ""}
                onChange={(selected) => handleChange(index, selected?.value || "")}
                isDisabled={isClosed}
                options={drivers.map((d) => ({
                  _id: d._id,
                  name: d.full_name
                }))}
                placeholder="Seleccione un piloto"
              />
            </div>

            {invalidIndexes.includes(index) && (
              <div className="invalid-feedback d-block">
                Este piloto fue reasignado a otra posición.
              </div>
            )}
          </div>
        ))}

        {!isClosed && (
          <button
            type="submit"
            className="btn btn-success mt-4"
            disabled={!canPredict || !isFormComplete}
          >
            Predecir
          </button>
        )}


      </form>
      )}
      </>
    )}

    </div>
  );
}

export default Predictions;
