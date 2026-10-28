import { useEffect, useState } from "react";
import TeamsServices from "./../../services/teams.services.js";
import DriversServices from "./../../services/drivers.services.js";
import { useRedirectToTab } from "../../hooks/useRedirectToTab.js";
import { useAlert } from "../../context/AlertContext.jsx";
import { useDialog } from "../../context/DialogContext.jsx";
import SearchableSelect from "../SearchableSelect.jsx";
import LoaderSpinner from "../LoaderSpinner.jsx";

const ROLE_OPTIONS = [
  { _id: "titular", name: "Titular" },
  { _id: "suplente", name: "Suplente" },
];

// "Sin asignar" (role ausente/null) cuenta como suplente para el límite de
// titulares, pero se muestra distinto en el select para que el admin note
// que todavía no lo definió.
const normalizeRole = (driver) =>
  driver.role === "titular" ? "titular" : (driver.role === "suplente" ? "suplente" : null);

function TeamsDriversAdmin({ searchTerm = "" }) {
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

        // Acá se muestran todos los pilotos, incluidos los deshabilitados
        // (a diferencia del roster público/los selects de predicción, que
        // siguen filtrando por `active`).
        setTeams(teamsData);
        setDrivers(driversData);
        setOriginalDrivers(driversData);

        validateTeams(driversData);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const validateTeams = (driversList) => {
    const titularCounts = {};

    driversList.forEach((d) => {
      if (d.team && normalizeRole(d) === "titular") {
        titularCounts[d.team] = (titularCounts[d.team] || 0) + 1;
      }
    });

    const overLimit = Object.keys(titularCounts).filter(
      (team) => titularCounts[team] > 2
    );

    setInvalidTeams(overLimit);
  };

  const handleChangeTeam = (driverId, newTeamId) => {
    const updated = drivers.map((d) =>
      // Sin equipo no hay rol posible: se limpia junto con la escudería.
      d._id === driverId ? { ...d, team: newTeamId, role: newTeamId ? d.role : null } : d
    );

    setDrivers(updated);
    validateTeams(updated);
  };

  const handleChangeRole = (driverId, newRole) => {
    const updated = drivers.map((d) =>
      d._id === driverId ? { ...d, role: newRole } : d
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
        return original && (original.team !== driver.team || normalizeRole(original) !== normalizeRole(driver));
      });

      if (modifiedDrivers.length === 0) {
        showAlert("No hay cambios para guardar.", "info");
        return;
      }

      const confirmed = await confirmDialog({
        title: "¿Guardar asignaciones?",
        message: "Esta acción actualizará los equipos y pilotos seleccionados.",
        confirmText: "Guardar",
        cancelText: "Cancelar",
        confirmVariant: "success"
      });
      if (!confirmed) return;

      setSaving(true);

      await DriversServices.updateDriverAssignments(
        modifiedDrivers.map((driver) => ({
          driverId: driver._id,
          team: driver.team || null,
          role: normalizeRole(driver),
        }))
      );

      showAlert("Asignaciones actualizadas correctamente", "success");
      redirectToTab("Asignaciones");
    } catch (err) {
      console.error(err);
      showAlert(err.message || "No se pudieron guardar las asignaciones.", "danger", true);
    } finally {
      setSaving(false);
    }
  };

  const teamsWithNone = [
    { _id: "", name: "Sin escudería" },
    ...teams
  ];

  const filteredDrivers = drivers.filter((d) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const pilotMatch = d.full_name.toLowerCase().includes(lowerSearch);
    const currentTeam = teams.find((t) => t._id === d.team);
    const teamMatch = currentTeam
      ? currentTeam.name.toLowerCase().includes(lowerSearch)
      : "sin escuderia".includes(lowerSearch);
    return pilotMatch || teamMatch;
  });

  if (loading) return <LoaderSpinner />;

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table admin-table-assignments">
            <thead>
              <tr>
                <th className="sticky-col col-piloto">Piloto</th>
                <th>Escudería actual</th>
                <th>Cambiar a</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => {
                const currentTeam = teams.find((t) => t._id === driver.team) || null;
                const isInvalid = driver.team && invalidTeams.includes(driver.team);

                return (
                  <tr key={driver._id} className={isInvalid ? "table-danger" : ""}>
                    <td className="sticky-col col-piloto">{driver.full_name}</td>

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

                    <td className="col-team-select">
                      <SearchableSelect
                        options={teamsWithNone}
                        value={driver.team || ""}
                        onChange={(selected) =>
                          handleChangeTeam(driver._id, selected ? selected.value : "")
                        }
                      />
                      {isInvalid && (
                        <div className="text-danger small mt-1">
                          Este equipo supera el límite de 2 titulares.
                        </div>
                      )}
                    </td>

                    <td className="col-role-select">
                      <SearchableSelect
                        options={ROLE_OPTIONS}
                        value={normalizeRole(driver) || ""}
                        onChange={(selected) =>
                          handleChangeRole(driver._id, selected ? selected.value : null)
                        }
                        isDisabled={!driver.team}
                        placeholder={driver.team ? "Sin asignar" : "Sin equipo"}
                      />
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
          className={`btn-admin-add ${invalidTeams.length > 0 ? 'bg-secondary border-secondary' : 'bg-success border-success'}`}
          disabled={saving}
        >
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
