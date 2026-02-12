import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CircuitsServices from "../../services/circuits.services";
import RacesServices from "../../services/races.services";
import DriversServices from "../../services/drivers.services";
import TeamsServices from "../../services/teams.services";
import UsersServices from "../../services/users.services";

import RacesTable from "./../../components/dashboardTabs/RacesTable.jsx";
import CircuitsTable from "./../../components/dashboardTabs/CircuitsTable.jsx";
import DriversTable from "./../../components/dashboardTabs/DriversTable.jsx";
import TeamsTable from "./../../components/dashboardTabs/TeamsTable.jsx";
import UsersTable from "./../../components/dashboardTabs/UsersTable.jsx";
import TeamsDriversAdmin from "./../../components/dashboardTabs/Assignments.jsx";

import { useAlert } from "../../context/AlertContext.jsx";
import { useDialog } from "../../context/DialogContext.jsx";

const TABS = {
  RACES: "Carreras",
  CIRCUITS: "Circuitos",
  TEAMS: "Escuderias",
  DRIVERS: "Pilotos",
  USERS: "Usuarios",
  ASSIGNMENTS: "Asignaciones",
};


const groupRacesByCircuitAndYear = (races) => {
  const grouped = {};

  races.forEach((race) => {
    const circuitId = race.id_circuit;
    const year = new Date(race.date_gp_start).getUTCFullYear();
    const key = `${circuitId}_${year}`;

    if (!grouped[key]) {
      grouped[key] = {
        gp_name: race.circuit?.gp_name || "N/A",
        circuitId,
        circuitName: race.circuit?.circuit_name || "N/A",
        country: race.circuit?.country || "N/A",
        dateStart: race.date_gp_start,
        dateEnd: race.date_gp_end,
        raceTypes: new Set(),
        gpRaceId: race._id,
        year,
      };
    }

    const type = race.points_system?.type;
    if (type) grouped[key].raceTypes.add(type);
  });

  const allRaces = Object.values(grouped).map((g) => ({
    ...g,
    raceTypes: Array.from(g.raceTypes).join(" - "),
  }));

  const byYear = allRaces.reduce((acc, race) => {
    if (!acc[race.year]) acc[race.year] = [];
    acc[race.year].push(race);
    return acc;
  }, {});

  const result = Object.keys(byYear)
    .sort((a, b) => a - b)
    .flatMap((year) => {
      const sorted = byYear[year].sort(
        (a, b) => new Date(a.dateStart) - new Date(b.dateStart)
      );
      sorted.forEach((g, idx) => (g.round = idx + 1));
      return sorted;
    });

  return result;
};



function Dashboard() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("Todos");
  const [availableYears, setAvailableYears] = useState([]);
  
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || TABS.RACES;
  const [activeTab, setActiveTab] = useState(initialTab);

  const { confirmDialog } = useDialog();
  const { showAlert } = useAlert();

  const getNestedValue = (obj, path) => {
    const parts = path.split(".");
    let value = obj;

    for (const part of parts) {
      if (Array.isArray(value)) {
        value = value
          .map((v) => getNestedValue(v, parts.slice(parts.indexOf(part)).join(".")))
          .flat();
        break;
      } else {
        value = value?.[part];
      }

      if (value === undefined || value === null) break;
    }

    return value;
  };

  const filterData = (data, keys) => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();

    return data.filter((item) =>
      keys.some((key) => {
        const value = getNestedValue(item, key);

        if (Array.isArray(value)) {
          return value.some(
            (v) => v && String(v).toLowerCase().includes(lower)
          );
        }

        if (value == null) return false;
        return String(value).toLowerCase().includes(lower);
      })
    );
  };


  const fetchRaces = async () => {
    try {
      const data = await RacesServices.findAll();
      const grouped = groupRacesByCircuitAndYear(data);
      setRaces(grouped);

      const years = [...new Set(grouped.map((r) => r.year))].sort((a, b) => b - a);
      setAvailableYears(years);

      const currentYear = new Date().getUTCFullYear();
      if (years.includes(currentYear)) {
        setFilterYear(currentYear.toString());
      } else {
        setFilterYear("Todos");
      }
    } catch (err) {
      console.error("Error al cargar carreras:", err);
    }
  };

  const fetchCircuits = async () => {
    try {
      setCircuits(await CircuitsServices.findAll());
    } catch (err) {
      console.error("Error al cargar circuitos:", err);
    }
  };

  const fetchDrivers = async () => {
    try {
      setDrivers(await DriversServices.findAll());
    } catch (err) {
      console.error("Error al cargar pilotos:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      setTeams(await TeamsServices.findAllTeams());
    } catch (err) {
      console.error("Error al cargar escuderías:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsers(await UsersServices.find());
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };


  useEffect(() => {
    if (activeTab === TABS.RACES) fetchRaces();
    else if (activeTab === TABS.CIRCUITS) fetchCircuits();
    else if (activeTab === TABS.DRIVERS) fetchDrivers();
    else if (activeTab === TABS.TEAMS) fetchTeams();
    else if (activeTab === TABS.USERS) fetchUsers();
  }, [activeTab]);

  // --- Acciones ---
  const handleEdit = (id, year) => {
    if (activeTab === TABS.RACES) navigate(`/race/${id}/edit/${year}`);
    else if (activeTab === TABS.CIRCUITS) navigate(`/circuit/${id}/edit`);
    else if (activeTab === TABS.DRIVERS) navigate(`/driver/${id}/edit`);
    else if (activeTab === TABS.TEAMS) navigate(`/team/${id}/edit`);
  };

  const handleDelete = async (id, name) => {
  try {
      // --- CIRCUITOS ---
      if (activeTab === TABS.CIRCUITS) {
        const races = await RacesServices.findAll();
        const hasRace = races.some((r) => r.id_circuit === id);
        if (hasRace) {
          showAlert(`❌ No puedes eliminar el circuito "${name}" porque tiene carreras asignadas.`, "danger", true);
          return;
        }
      }

      // --- CARRERAS ---
      if (activeTab === TABS.RACES) {
        const races = await RacesServices.findAll();
        const raceToDelete = races.find((r) => r._id === id);
        if (!raceToDelete) {
          showAlert(`❌ No se encontró la carrera a eliminar.`, "danger", true);
          return;
        }

        const hasResults = Array.isArray(raceToDelete.results) && raceToDelete.results.length > 0;
        const hasStarted = new Date(raceToDelete.date_gp_start) < new Date();

        if (hasResults) {
          showAlert(`❌ No puedes eliminar la carrera "${name}" porque ya tiene resultados cargados.`, "danger", true);
          return;
        }

        if (hasStarted) {
          showAlert(`❌ No puedes eliminar la carrera "${name}" porque la fecha de inicio ya ha pasado.`, "danger", true);
          return;
        }
      }

      // --- EQUIPOS ---
      if (activeTab === TABS.TEAMS) {
        const team = teams.find((t) => t._id === id);
        if (team?.drivers?.length > 0) {
          showAlert(`❌ No puedes eliminar la escudería "${name}" porque tiene pilotos asignados.`, "danger", true);
          return;
        }
      }

      // --- PILOTOS ---
      if (activeTab === TABS.DRIVERS) {
        const driver = drivers.find((d) => d._id === id);

        if (driver.team_info && driver.team_info._id) {
          showAlert(`❌ No puedes eliminar el piloto "${name}" porque pertenece a una escudería. Se recomienda deshabilitarlo en su lugar.`, "danger", true);
          return;
        }

        const driverUsed = await DriversServices.checkDriverUsedInRaces(id);
        console.log("Driver used in races:", driverUsed.used)
        if (driverUsed.used) {
          showAlert(`❌ No puedes eliminar el piloto "${name}" porque ya fue utilizado en alguna carrera. Se recomienda deshabilitarlo en su lugar.`, "danger", true);
          return;
        }
      }

      await confirmDialog({
        title: `¿Eliminar "${name}"?`,
        message: "Por favor confirmar que desea eliminar este registro.",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        confirmVariant: "danger",
      });


      if (activeTab === TABS.RACES) {
        await RacesServices.deleteRace(id);
        fetchRaces();
      } else if (activeTab === TABS.CIRCUITS) {
        await CircuitsServices.deleteCircuit(id);
        fetchCircuits();
      } else if (activeTab === TABS.DRIVERS) {
        await DriversServices.deleteDriver(id);
        fetchDrivers();
      } else if (activeTab === TABS.TEAMS) {
        await TeamsServices.deleteTeam(id);
        fetchTeams();
      }

      showAlert(`✅ Eliminado correctamente.`, "success");
    } catch (err) {

      console.error(err);
    }
  };

useEffect(() => {
  const tabFromUrl = searchParams.get("tab");
  if (tabFromUrl) {
    const normalized = tabFromUrl.trim().toLowerCase();

    const matchedTab = Object.values(TABS).find(
      (t) => t.toLowerCase() === normalized
    );

    if (matchedTab) {
      setActiveTab(matchedTab);
    }
  }
}, [searchParams]);



  const handleToggleBlockUser = async (user) => {
  const action = user.blocked ? "Desbloquear" : "Bloquear";
  console.log(user);
  await confirmDialog({
    title: `¿Deseas ${action} al usuario "${user.name} ${user.last_name}"?`,
    message: "Esta acción cambiará el estado del usuario, pero no será eliminado de nuestros registros.",
    confirmText: `${action}`,
    cancelText: "Cancelar",
    confirmVariant: `${(action === 'Bloquear') ? 'danger' : 'success'}`,
  });

  try {
    if (user.blocked) {
      await UsersServices.unblockUser(user._id);
      showAlert(`✅ Usuario "${user.name} ${user.last_name}" desbloqueado correctamente`, "success");
    } else {
      await UsersServices.blockUser(user._id);
      showAlert(`✅ Usuario "${user.name} ${user.last_name}" bloqueado correctamente`, "success");
    }

    fetchUsers();
  } catch (err) {
    console.error("Error al cambiar estado de usuario:", err);
    showAlert(`❌ No se pudo actualizar el estado del usuario`, "danger", true);
  }
  };

  const handleToggleDriver = async (driver) => {
  try {
   
    if (!driver.active && driver.team_info && driver.team_info._id) {
      
      const activeDriversInTeam = drivers.filter(
        (d) =>
          d.team_info &&
          d.team_info._id === driver.team_info._id &&
          d.active !== false &&
          d._id !== driver._id
      );

      if (activeDriversInTeam.length >= 2) {
        showAlert(`❌ No puedes habilitar a "${driver.full_name}" porque el equipo "${driver.team_info.name}" ya tiene 2 pilotos activos.`, "danger", true);
        return;
      }
    }

    const action = driver.active ? "Deshabilitar" : "Habilitar";

    await confirmDialog({
      title: `¿Deseas ${action.toLowerCase()} al piloto "${driver.full_name}"?`,
      message: "Esta acción cambiará el estado del piloto, pero no será eliminado de nuestros registros.",
      confirmText: `${action}`,
      cancelText: "Cancelar",
      confirmVariant: `${(action === 'Deshabilitar') ? 'danger' : 'success'}`,
    });

    if (driver.active) {
      await DriversServices.disableDriver(driver._id);
      showAlert(`✅ Piloto deshabilitado correctamente`, "success");
    } else {
      await DriversServices.enableDriver(driver._id);
      showAlert(`✅ Piloto habilitado correctamente`, "success");
    }

    fetchDrivers(); 
  } catch (err) {
    console.error("Error al cambiar estado del piloto:", err);
  }
};

  const renderTabContent = () => {
  switch (activeTab) {
    case TABS.RACES:
      return <RacesTable races={filterData(
    races.filter((r) => filterYear === "Todos" || r.year === Number(filterYear)),
    ["country", "gp_name", "raceTypes"]
  )} onEdit={handleEdit} onDelete={handleDelete} />;
    case TABS.CIRCUITS:
      return <CircuitsTable circuits={filterData(circuits, ["circuit_name", "country", "city", "length", "laps"])} onEdit={handleEdit} onDelete={handleDelete} />;
    case TABS.DRIVERS:
      return (
        <DriversTable
          drivers={filterData(drivers, ["full_name", "trigram", "country", "number", "team_info.name"])}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggleDriver}
        />
      );
    case TABS.TEAMS:
      console.log(teams);
      return <TeamsTable teams={filterData(teams, ["name", "chief", "power_unit", "country", "drivers.full_name"])} onEdit={handleEdit} onDelete={handleDelete} />;
    case TABS.USERS:
      return <UsersTable users={filterData(users, ["name", "last_name", "email", "country", "points", "date_register"])} onToggleBlock={handleToggleBlockUser} />;
    case TABS.ASSIGNMENTS:
      return <TeamsDriversAdmin />;
    default:
      return <p>Selecciona una pestaña.</p>;
  }
};


  return (
    <div className="dashboard-container container mt-4">
      <h2>Panel de control</h2>

      <div className="tabs-header d-flex align-items-center flex-wrap gap-2 justify-content-between">
         <div className="d-flex align-items-center gap-2">
        {![TABS.ASSIGNMENTS, TABS.USERS].includes(activeTab) && (
          <button
            className="btn btn-success me-2"
            onClick={() => {
              if (activeTab === TABS.RACES) navigate("/race/create");
              else if (activeTab === TABS.CIRCUITS) navigate("/circuit/create");
              else if (activeTab === TABS.DRIVERS) navigate("/driver/create");
              else if (activeTab === TABS.TEAMS) navigate("/team/create");
            }}
          >
            {activeTab === TABS.RACES && "Agregar Carrera"}
            {activeTab === TABS.CIRCUITS && "Agregar Circuito"}
            {activeTab === TABS.DRIVERS && "Agregar Piloto"}
            {activeTab === TABS.TEAMS && "Agregar Escudería"}
          </button>
        )}

        {Object.values(TABS).map((tabName) => (
          <button
            key={tabName}
            className={activeTab === tabName ? "tab-button active" : "tab-button"}
            onClick={() => {
              setActiveTab(tabName);
              setSearchTerm("");
              navigate({ search: `?tab=${tabName}` });
            }}
          >
            {tabName}
          </button>
        ))}

        </div>

        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "400px" }}>
          <div className="input-group">
            <span className="input-group-text">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder={`Buscar en ${activeTab.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === TABS.RACES && (
            <select
              className="form-select"
              style={{ width: "120px" }}
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>


      </div>

      


      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
}

export default Dashboard;
