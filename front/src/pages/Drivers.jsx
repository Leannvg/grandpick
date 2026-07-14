import { useEffect, useState } from "react";
import { useLoader } from "../context/LoaderContext";
import DriverCardDesktop from "../components/drivers/DriverCardDesktop";
import DriverCardMobile from "../components/drivers/DriverCardMobile";

import TeamsServices from "../services/teams.services";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    showLoader();
    TeamsServices.findAllTeams()
      .then((teams) => {
        // Aplanar pilotos desde las escuderías y filtrar por active: true
        const activeDriversOrdered = teams.flatMap(team =>
          (team.drivers || [])
            .filter(driver => driver.active === true)
            .map(driver => ({
              ...driver,
              // Asegurar que team_id esté presente si lo necesitan las tarjetas, aunque podría ser 'team' en este contexto
              team_id: driver.team_id || driver.team || team._id,
              team_info: team // Pasar todo el objeto de la escudería como team_info
            }))
        );

        setDrivers(activeDriversOrdered);
      })
      .catch(err => {
        console.error("Error loading drivers:", err);
      })
      .finally(() => {
        hideLoader();
      });

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className="drivers-page page-wrapper">
      <section className="page-section container text-center">
        <header className="page-header">
          <p className="section-label">Temporada actual</p>
          <h1 className="section-title">PILOTOS</h1>
          <p className="section-subtitle">Los verdaderos protagonistas de la pista</p>
        </header>

        <div className="drivers-grid">
          {drivers.map((driver) => (
            isMobile ? (
              <DriverCardMobile key={driver._id.$oid} driver={driver} />
            ) : (
              <DriverCardDesktop key={driver._id.$oid} driver={driver} />
            )
          ))}
        </div>
      </section>
    </div>
  );
}

export default Drivers;

