import { useState, useEffect, useCallback } from "react";
import Points from "../../services/points.services.js";
import RacesServices from "../../services/races.services.js";
import CircuitsServices from "../../services/circuits.services.js";
import PredictionsForm from "../PredictionsForm.jsx";
import * as helpers from "../../utils/helpers.js";
import { useRedirectToTab } from "../../hooks/useRedirectToTab.js";
import { DateTime } from "luxon";
import { useAlert } from "../../context/AlertContext.jsx";
import { useDialog } from "../../context/DialogContext.jsx";
import SearchableSelect from "../SearchableSelect.jsx";
import SubmitButton from "../SubmitButton.jsx";


function RaceForm({
  initialData = {},
  onSave,
  submitText = "Guardar",
  action = "",
  race_types: initialRaceTypes = []
}) {
  const [points, setPoints] = useState([]);
  const [circuitsAll, setCircuitsAll] = useState([]);
  const [enabledPoints, setEnabledPoints] = useState(initialData.enabledPoints || {});
  const [pointData, setPointData] = useState(initialData.pointData || {});
  const [circuit, setCircuit] = useState(initialData.circuit || "");
  const [circuitTimezone, setCircuitTimezone] = useState(initialData.circuitTimezone || "");
  const [dateStart, setDateStart] = useState(initialData.dateStart || "");
  const [dateFinish, setDateFinish] = useState(initialData.dateFinish || "");
  const [raceTypes, setRaceTypes] = useState(initialRaceTypes);
  const [errorsForm, setErrors] = useState({});
  const [year, setYear] = useState(String(DateTime.now().year));
  const [usedCircuits, setUsedCircuits] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const redirectToTab = useRedirectToTab();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

  useEffect(() => {
    if (points.length > 0 && !activeTab) {
      const firstEnabled = points.find(p => enabledPoints[p._id])?.type || points[0]?.type;
      setActiveTab(firstEnabled);
    }
  }, [points, enabledPoints, activeTab]);


  useEffect(() => {
    CircuitsServices.findAll().then(setCircuitsAll);
    Points.findAll().then(setPoints);
  }, []);

  useEffect(() => {
    if (!initialRaceTypes.length || !circuitTimezone) return;

    const refreshedEnabled = {};
    const refreshedData = {};

    initialRaceTypes.forEach(rt => {
      refreshedEnabled[rt.points_system._id] = true;

      const date = DateTime.fromJSDate(new Date(rt.date_race)).setZone(circuitTimezone);

      const reorderedResults = [];
      (rt.results || []).forEach(r => {
        console.log("r:", r)
        reorderedResults[r.position - 1] = {
          position: r.position,
          driver: r.driver
        };
      });

      refreshedData[rt.points_system._id] = {
        fecha: date.toISODate(),
        hora: date.toFormat("HH:mm"),
        results: reorderedResults,
      };
    });

    setEnabledPoints(refreshedEnabled);
    setPointData(refreshedData);
  }, [initialRaceTypes, circuitTimezone]);

  const handlePoints = (id, checked) => {
    setEnabledPoints((prev) => ({ ...prev, [id]: checked }));
  };

  const handlePointData = (id, field, value) => {
    setPointData((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleCircuit = (selectedOption) => {
    console.log("Selected option:", selectedOption);
    console.log("Circuit timezone:", selectedOption?.timezone);

    setCircuit(selectedOption?.value || "");
    setCircuitTimezone(selectedOption?.timezone || "");
  };

  const handleDriverChange = useCallback((pointId, position, driverId) => {
    setPointData((prev) => {
      const updatedResults = [...(prev[pointId]?.results || [])];

      updatedResults[position] = {
        position: position + 1,
        driver: driverId
      };

      return {
        ...prev,
        [pointId]: {
          ...prev[pointId],
          results: updatedResults,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (action === "create" && points.length > 0 && Object.keys(enabledPoints).length === 0) {
      const updatedEnabled = {};
      const updatedData = {};

      points.forEach((p) => {
        if (p.type.toLowerCase() === "race") {
          updatedEnabled[p._id] = true;
          const now = DateTime.now();
          updatedData[p._id] = {
            fecha: "",
            hora: "",
            results: [],
          };
        } else {
          updatedEnabled[p._id] = false;
        }
      });

      setEnabledPoints(updatedEnabled);
      setPointData(updatedData);
    }
  }, [action, points]);


  useEffect(() => {
    if (!year) return;

    const loadUsedCircuits = async () => {
      try {
        const races = await RacesServices.findAllByYear(year);
        const grouped = {};
        console.log("Races:", races)

        races.forEach((r) => {
          const id = r.id_circuit;
          const type = r.points_system?.type?.toLowerCase();
          if (!grouped[id]) grouped[id] = new Set();
          grouped[id].add(type);
        });

        const used = Object.keys(grouped);
        setUsedCircuits(used);
      } catch (err) {
        console.error("Error al obtener circuitos usados:", err);
      }
    };

    loadUsedCircuits();
  }, [year]);

  useEffect(() => {
    if (dateStart) {
      const yearFromDate = DateTime.fromISO(dateStart).year;
      setYear(String(yearFromDate));
    }
  }, [dateStart]);

  useEffect(() => {
    if (dateStart && dateFinish && dateFinish < dateStart) {
      showAlert("La fecha fin no puede ser menor que la fecha inicio", "danger", true);
    }
  }, [dateStart, dateFinish]);


  useEffect(() => {
    if (!year) return;

    if (action === "create") {
      setDateStart("");
      setDateFinish("");

      setPointData((prev) => {
        const cleared = {};
        for (const key in prev) {
          cleared[key] = {
            ...prev[key],
            fecha: "",
            hora: ""
          };
        }
        return cleared;
      });
    }
  }, [year]);




  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    try {
      const updates = [];
      const deletes = [];
      const creates = [];
      let formValid = true;
      const newErrors = {};

      if (!circuit) {
        newErrors.id_circuit = "El circuito es requerido";
        formValid = false;
      }
      if (!dateStart) {
        newErrors.date_gp_start = "La fecha de inicio es requerida";
        formValid = false;
      }
      if (!dateFinish) {
        newErrors.date_gp_end = "La fecha de fin es requerida";
        formValid = false;
      }

      if (!formValid) {
        setErrors(newErrors);
        showAlert("Por favor completa los campos requeridos.", "danger", true);
        return;
      }

      const anyEnabled = Object.values(enabledPoints).some(Boolean);
      if (!anyEnabled) {
        showAlert("Debe haber al menos una carrera habilitada.", "danger", true);
        return;
      }


      for (const p of points) {
        if (!enabledPoints[p._id]) continue;

        const data = pointData[p._id] || {};
        const resultsArray = data.results || [];
        const totalPositions = p.points?.length || 0;
        const selections = Array(totalPositions).fill("").map((_, idx) => {
          const result = resultsArray.find(r => r.position === idx + 1);
          return result?.driver || "";
        });

        const filled = selections.filter(s => s !== "").length;
        const empty = totalPositions - filled;

        if (filled > 0 && empty > 0) {
          showAlert(
            `La grilla de posiciones de ${p.type} está incompleta. Debes completar TODAS las posiciones o dejarlas TODAS vacías.`, "danger", true
          );
          return;
        }
      }

      let dialog = ""
      if (action === "edit") {
        dialog = {
          title: "¿Deseas editar esta carrera?",
          message: "Se actualizarán los cambios realizados.",
          confirmText: "Editar",
          cancelText: "Cancelar",
          confirmVariant: "success",
        }
      } else {
        dialog = {
          title: "¿Deseas crear una nueva carrera?",
          message: "Se creará un nuevo fin de semana de carrera con el circuito y fechas seleccionados.",
          confirmText: "Crear",
          cancelText: "Cancelar",
          confirmVariant: "success",
        }
      }

      const confirmed = await confirmDialog(dialog);
      if (!confirmed) return;

      const existingByPoint = {};
      raceTypes.forEach(rt => {
        existingByPoint[rt.points_system._id] = rt;
      });

      const normalizeResults = (results = []) =>
        results
          .filter(r => r && r.driver)
          .map((r, idx) => ({
            position: r.position ?? idx + 1,
            driver: r.driver.toString(),
          }));

      for (const p of points) {
        const isEnabled = !!enabledPoints[p._id];
        const data = pointData[p._id] || {};
        const existing = existingByPoint[p._id];

        if (!isEnabled && !existing) continue;

        const startDT = DateTime.fromISO(dateStart, { zone: circuitTimezone }).startOf("day");
        const startUTC = startDT.isValid ? startDT.toUTC().toJSDate() : null;

        const endDT = DateTime.fromISO(dateFinish, { zone: circuitTimezone }).startOf("day");
        const endUTC = endDT.isValid ? endDT.toUTC().toJSDate() : null;

        const dt = DateTime.fromISO(`${data.fecha}T${data.hora}`, {
          zone: circuitTimezone,
        });
        const fechaUTC = dt.isValid ? dt.toUTC().toJSDate() : null;

        if (isEnabled && (!startUTC || !endUTC || !fechaUTC)) {
          showAlert(`Error en las fechas de ${p.type}. Asegúrate de completar fecha y hora.`, "danger", true);
          return;
        }

        if (existing && isEnabled) {
          updates.push({
            _id: existing._id,
            type: p.type,
            points_system: p._id,
            date_gp_start: startUTC,
            date_gp_end: endUTC,
            date_race: fechaUTC,
            date: data.fecha,
            time: data.hora,
            id_circuit: circuit,
            state: "Pendiente",
            results: normalizeResults(data.results),
          });
        } else if (existing && !isEnabled) {
          deletes.push(existing._id);
        } else if (!existing && isEnabled) {
          creates.push({
            id_circuit: circuit,
            type: p.type,
            date_gp_start: startUTC,
            date_gp_end: endUTC,
            date_race: fechaUTC,
            date: data.fecha,
            time: data.hora,
            points_system: p._id,
            state: "Pendiente",
            results: normalizeResults(data.results),
          });
        }
      }

      console.log("Updates:", updates);
      console.log("Deletes:", deletes);
      console.log("Creates:", creates);

      await Promise.all([
        ...updates.map(r => RacesServices.updateRace(r._id, r)),
        ...deletes.map(id => RacesServices.deleteRace(id)),
        ...creates.map(r => RacesServices.createRace(r)),
      ]);

      const refreshed = await RacesServices.findByCircuitAndYear(circuit, year);
      setRaceTypes(refreshed.race_types);

      const refreshedEnabled = {};
      const refreshedData = {};

      refreshed.race_types.forEach(rt => {
        refreshedEnabled[rt.points_system._id] = true;
        refreshedData[rt.points_system._id] = {
          fecha: DateTime.fromJSDate(new Date(rt.date_race))
            .setZone(circuitTimezone)
            .toISODate(),
          hora: DateTime.fromJSDate(new Date(rt.date_race))
            .setZone(circuitTimezone)
            .toFormat("HH:mm"),
          results: rt.results || [],
        };
      });

      setEnabledPoints(refreshedEnabled);
      setPointData(refreshedData);
      setErrors({});

      if (action === "edit") {
        showAlert("Carrera actualizada con éxito ✅", "success");
      } else {
        showAlert("Carrera creada con éxito ✅", "success");
      }

      redirectToTab("Carreras")

    } catch (error) {
      if (!error) return

      const parsedErrors = helpers.parseErrorMessage(error);
      const perPointErrors = {};
      points.forEach(p => {
        if (enabledPoints[p._id]) {
          const data = pointData[p._id] || {};
          if (!data.fecha) {
            perPointErrors[p._id] = {
              ...perPointErrors[p._id],
              date: parsedErrors.date || "La fecha es requerida",
            };
          }
          if (!data.hora) {
            perPointErrors[p._id] = {
              ...perPointErrors[p._id],
              time: parsedErrors.time || "La hora es requerida",
            };
          }
        }
      });

      setErrors({
        ...parsedErrors,
        perPoint: perPointErrors,
      });
      showAlert("Ups! parece que hay campos incompletos.", "danger", true);
    }
  };


  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;


  return (
    <form onSubmit={handleSubmit} className="text-start">
      {/* GRUPO 1: Fin de semana */}
      <div className="row mb-5 align-items-center">
        <div className="col-12 col-md-3 mb-3 mb-md-0">
          <div className="d-flex justify-content-center align-items-center rounded-3 p-2 text-white text-center" style={{ backgroundColor: "#111d2a", minHeight: "48px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.5px" }}>
            Fin de semana
          </div>
        </div>
        <div className="col-12 col-md-9">
          <div className="gp-input-group-container">
            <div className="gp-input-group">
              <span className="gp-input-label">Año</span>
              <select
                className="form-control"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={action === "edit"}
              >
                <option value="">Selecciona un año</option>
                {Array.from({ length: 7 }, (_, i) => DateTime.now().year - 1 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="gp-input-group-container">
            <div className={`gp-input-group ${errorsForm.id_circuit ? "is-invalid" : ""}`} style={{ overflow: "visible" }}>
              <span className="gp-input-label">Circuito</span>
              <div className="flex-fill">
                <SearchableSelect
                  options={circuitsAll}
                  value={circuit}
                  onChange={handleCircuit}
                  isInvalid={!!errorsForm.id_circuit}
                  isDisabled={action === "edit"}
                  getOptionDisabled={(opt) => usedCircuits.includes(opt._id)}
                  placeholder="Selecciona un circuito"
                />
              </div>
            </div>
            {errorsForm.id_circuit && (
              <div className="invalid-feedback d-block text-start mt-1">{errorsForm.id_circuit}</div>
            )}
          </div>

          <div className="d-flex gap-3 flex-column flex-md-row">
            <div className="gp-input-group-container">
              <div className={`gp-input-group ${errorsForm.date_gp_start ? "is-invalid" : ""}`}>
                <span className="gp-input-label">Inicio</span>
                <input
                  className="form-control"
                  type="date"
                  min={yearStart}
                  max={yearEnd}
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
              </div>
              {errorsForm.date_gp_start && (
                <div className="invalid-feedback d-block text-start mt-1">{errorsForm.date_gp_start}</div>
              )}
            </div>

            <div className="gp-input-group-container">
              <div className={`gp-input-group ${errorsForm.date_gp_end ? "is-invalid" : ""}`}>
                <span className="gp-input-label">Fin</span>
                <input
                  className="form-control"
                  type="date"
                  min={yearStart}
                  max={yearEnd}
                  value={dateFinish}
                  onChange={(e) => setDateFinish(e.target.value)}
                />
              </div>
              {errorsForm.date_gp_end && (
                <div className="invalid-feedback d-block text-start mt-1">{errorsForm.date_gp_end}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRUPO 2: Tipos */}
      <div className="row mb-5 align-items-center">
        <div className="col-12 col-md-3 mb-3 mb-md-0">
          <div className="d-flex justify-content-center align-items-center rounded-3 p-2 text-white text-center" style={{ backgroundColor: "#111d2a", minHeight: "48px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.5px" }}>
            Tipos
          </div>
        </div>
        <div className="col-12 col-md-9">
          {points.map((p) => {
            const isEnabled = !!enabledPoints[p._id];
            return (
              <div className="d-flex gap-3 flex-column flex-md-row mb-3 align-items-start" key={p._id}>
                {/* Checkbox embebido en gp-input-group */}
                <div className="gp-input-group-container" style={{ maxWidth: "220px" }}>
                  <div className="gp-input-group">
                    <span className="gp-input-label">{p.type}</span>
                    <div className="d-flex align-items-center justify-content-center bg-white px-3 flex-fill">
                      <input
                        className="form-check-input m-0"
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => handlePoints(p._id, e.target.checked)}
                        disabled={
                          isEnabled && Object.values(enabledPoints).filter(Boolean).length === 1
                        }
                        style={{ cursor: "pointer", width: "18px", height: "18px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Fecha gp-input-group */}
                <div className="gp-input-group-container">
                  <div className={`gp-input-group ${!isEnabled ? "opacity-50" : ""} ${errorsForm.perPoint?.[p._id]?.date && isEnabled ? "is-invalid" : ""}`}>
                    <span className="gp-input-label">Fecha</span>
                    <input
                      className="form-control"
                      type="date"
                      min={dateStart || yearStart}
                      max={dateFinish || yearEnd}
                      disabled={!isEnabled}
                      value={pointData[p._id]?.fecha || ""}
                      onChange={(e) => handlePointData(p._id, "fecha", e.target.value)}
                    />
                  </div>
                  {errorsForm.perPoint?.[p._id]?.date && isEnabled && (
                    <div className="invalid-feedback d-block text-start mt-1">{errorsForm.perPoint[p._id].date || errorsForm.date}</div>
                  )}
                </div>

                {/* Hora gp-input-group */}
                <div className="gp-input-group-container">
                  <div className={`gp-input-group ${!isEnabled ? "opacity-50" : ""} ${errorsForm.perPoint?.[p._id]?.time && isEnabled ? "is-invalid" : ""}`}>
                    <span className="gp-input-label">Hora</span>
                    <input
                      className="form-control"
                      type="time"
                      disabled={!isEnabled}
                      value={pointData[p._id]?.hora || ""}
                      onChange={(e) => handlePointData(p._id, "hora", e.target.value)}
                    />
                  </div>
                  {errorsForm.perPoint?.[p._id]?.time && isEnabled && (
                    <div className="invalid-feedback d-block text-start mt-1">{errorsForm.perPoint[p._id].time}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRUPO 3: Resultados */}
      {(action == "edit") && (
        <div className="row mb-5 align-items-start">
          <div className="col-12 col-md-3 mb-3 mb-md-0">
            <div className="d-flex justify-content-center align-items-center rounded-3 p-2 text-white text-center" style={{ backgroundColor: "#111d2a", minHeight: "48px", fontSize: "14px", fontWeight: "500", letterSpacing: "0.5px" }}>
              Resultados
            </div>
          </div>
          <div className="col-12 col-md-9">
            <nav className="mb-4">
              <div className="nav nav-pills gap-2" id="nav-tab" role="tablist">
                {points.map((p) => (
                  <button
                    key={p._id}
                    className={`nav-link ${activeTab === p.type ? "active" : ""}`}
                    id={`nav-${p.type}-tab`}
                    data-bs-toggle="pill"
                    data-bs-target={`#nav-${p.type}`}
                    type="button"
                    role="tab"
                    aria-controls={`nav-${p.type}`}
                    aria-selected={activeTab === p.type}
                    disabled={!enabledPoints[p._id]}
                    onClick={() => setActiveTab(p.type)}
                    style={{
                      backgroundColor: activeTab === p.type ? "#2e7d32" : "#111d2a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 24px",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                      opacity: enabledPoints[p._id] ? 1 : 0.4
                    }}
                  >
                    {p.type}
                  </button>
                ))}
              </div>
            </nav>

            <div className="tab-content" id="nav-tabContent">
              {points.map((p) => (
                <div
                  key={p._id}
                  className={`tab-pane fade ${activeTab === p.type ? "show active" : ""}`}
                  id={`nav-${p.type}`}
                  role="tabpanel"
                  aria-labelledby={`nav-${p.type}-tab`}
                >
                  {enabledPoints[p._id] ? (
                    <PredictionsForm
                      points={p}
                      race_types={raceTypes}
                      onDriverChange={handleDriverChange}
                    />
                  ) : (
                    <div className="text-muted p-3">
                      Habilita "{p.type}" arriba para editar predicciones.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-center mt-5">
        <SubmitButton ariaLabel={submitText} />
      </div>
    </form>
  );
}

export default RaceForm;
