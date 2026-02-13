import { useEffect, useState } from "react";
import DriverCardDesktop from "../components/drivers/DriverCardDesktop";
import DriverCardMobile from "../components/drivers/DriverCardMobile";

import TeamsServices from "../services/teams.services";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    setLoading(true);
    TeamsServices.findAllTeams()
      .then((teams) => {
        // Flatten drivers from teams and filter by active: true
        const activeDriversOrdered = teams.flatMap(team =>
          (team.drivers || [])
            .filter(driver => driver.active === true)
            .map(driver => ({
              ...driver,
              // Ensure team_id is present if needed by cards, although it might be 'team' in this context
              team_id: driver.team_id || driver.team || team._id
            }))
        );

        setDrivers(activeDriversOrdered);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading drivers:", err);
        setLoading(false);
      });

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando pilotos...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="drivers-section text-center page-section container">
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

