import { useEffect, useState } from "react";
import TeamsServices from "./../../services/teams.services.js";
import DriversServices from "./../../services/drivers.services.js";
import { useRedirectToTab } from "../../hooks/useRedirectToTab.js";
import { useAlert } from "../../context/AlertContext.jsx";
import { useDialog } from "../../context/DialogContext.jsx";
import SearchableSelect from "../SearchableSelect.jsx";
import LoaderCar from "../LoaderCar.jsx";

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

  if (loading) return <LoaderCar message="Cargando asignaciones..." />;

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
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
                const isInvalid = driver.team && invalidTeams.includes(driver.team);

                return (
                  <tr key={driver._id} className={isInvalid ? "table-danger" : ""}>
                    <td className="fw-bold">{driver.full_name}</td>

                    <td>
                      {currentTeam ? (
                        <div className="d-flex align-items-center">
                          <span className="me-2">{currentTeam.name}</span>
                          {isInvalid && (
                            <span className="badge bg-danger">
                              ⚠️ Excedido
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted italic">Sin escudería</span>
                      )}
                    </td>

                    <td style={{ minWidth: '250px' }}>
                      <SearchableSelect
                        options={teamsWithNone}
                        value={driver.team || ""}
                        onChange={(selected) =>
                          handleChangeTeam(driver._id, selected ? selected.value : "")
                        }
                      />
                      {isInvalid && (
                        <div className="text-danger small mt-1">
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
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button
          onClick={handleSave}
          className="btn-admin-add"
          disabled={saving}
          style={{ background: invalidTeams.length > 0 ? '#6c757d' : '#2e7d32' }}
        >
          <i className={`bi ${saving ? 'bi-hourglass-split' : 'bi-save-fill'}`}></i>
          {saving
            ? "Guardando..."
            : invalidTeams.length > 0
            ? "Corrige las asignaciones"
            : "Guardar cambios"}
        </button>
      </div>
    </>
  );
}

export default TeamsDriversAdmin;
