import { useEffect, useState } from "react";
import TeamsServices from "./../../services/teams.services.js";
import DriversServices from "./../../services/drivers.services.js";
import { useRedirectToTab } from "../../hooks/useRedirectToTab.js";
import { useAlert } from "../../context/AlertContext.jsx";
import { useDialog } from "../../context/DialogContext.jsx";
import SearchableSelect from "../SearchableSelect.jsx";

function TeamsDriversAdmin() {
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invalidTeams, setInvalidTeams] = useState([]);
  const [originalDrivers, setOriginalDrivers] = useState([]);

  const redirectToTab = useRedirectToTab();
  const { confirmDialog } = useDialog();
  const { showAlert } = useAlert();

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsData, driversData] = await Promise.all([
          TeamsServices.findAllTeams(),
          DriversServices.findAll()
        ]);

        const activeDrivers = driversData.filter((d) => d.active !== false);

        setTeams(teamsData);
        setDrivers(activeDrivers);
        setOriginalDrivers(driversData);

        validateTeams(activeDrivers);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const validateTeams = (driversList) => {
    const teamCounts = {};

    driversList.forEach((d) => {
      if (d.active !== false && d.team) {
        teamCounts[d.team] = (teamCounts[d.team] || 0) + 1;
      }
    });

    const overLimit = Object.keys(teamCounts).filter(
      (team) => teamCounts[team] > 2
    );

    setInvalidTeams(overLimit);
  };

  const handleChangeTeam = (driverId, newTeamId) => {
    const updated = drivers.map((d) =>
      d._id === driverId ? { ...d, team: newTeamId } : d
    );

    setDrivers(updated);
    validateTeams(updated);
  };

  const handleSave = async () => {
    if (invalidTeams.length > 0) {
      showAlert("Corrige las asignaciones antes de guardar.", "danger", true);
      return;
    }

    try {
      const modifiedDrivers = drivers.filter((driver) => {
        const original = originalDrivers.find((d) => d._id === driver._id);
        return original && original.team !== driver.team;
      });

      if (modifiedDrivers.length === 0) {
        showAlert("No hay cambios para guardar.", "info");
        return;
      }

      await confirmDialog({
        title: "¿Guardar asignaciones?",
        message: "Esta acción actualizará los equipos y pilotos seleccionados.",
        confirmText: "Guardar",
        cancelText: "Cancelar",
        confirmVariant: "success"
      });

      setSaving(true);

      await Promise.all(
        modifiedDrivers.map((driver) =>
          DriversServices.editDashboardDriver(driver._id, { team: driver.team })
        )
      );

      showAlert("Asignaciones actualizadas correctamente ✅", "success");
      redirectToTab("Asignaciones");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const teamsWithNone = [
    { _id: "", name: "Sin escudería" },
    ...teams
  ];

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="container mt-4">
      <p className="text-muted">
        Acá podés asignar o cambiar los pilotos de cada escudería.
      </p>

      <div>
        <table className="table mt-3 align-middle">
          <thead>
            <tr>
              <th>Piloto</th>
              <th>Escudería actual</th>
              <th>Cambiar a</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => {
              const currentTeam = teams.find((t) => t._id === driver.team) || null;
              const isInvalid =
                driver.team && invalidTeams.includes(driver.team);

              return (
                <tr
                  key={driver._id}
                  className={isInvalid ? "table-danger" : ""}
                >
                  <td>{driver.full_name}</td>

                  <td>
                    {currentTeam ? (
                      <>
                        {currentTeam.name}
                        {isInvalid && (
                          <span className="badge bg-danger ms-2">
                            ⚠️ Excedido
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Sin escudería</span>
                    )}
                  </td>

                  <td>
                     <SearchableSelect
                        options={teamsWithNone}
                        value={driver.team || ""}
                         onChange={(selected) =>
                            handleChangeTeam(driver._id, selected ? selected.value : "")
                          }
                      />

                    {isInvalid && (
                      <div className="invalid-feedback">
                        Este equipo supera el límite de 2 pilotos.
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button
          onClick={handleSave}
          className="btn btn-primary"
        >
          {saving
            ? "Guardando..."
            : invalidTeams.length > 0
            ? "Corrige las asignaciones"
            : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

export default TeamsDriversAdmin;
