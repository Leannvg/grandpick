import { useEffect, useState } from "react";
import DriversServices from "../services/drivers.services";
import DriverCardDesktop from "../components/drivers/DriverCardDesktop";
import DriverCardMobile from "../components/drivers/DriverCardMobile";

import TeamsServices from "../services/teams.services";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    Promise.all([
      TeamsServices.findAllTeams(),
      DriversServices.findAll()
    ]).then(([teams, allDrivers]) => {
      const orderedDrivers = [];
      const assignedIds = new Set();

      // Group drivers by team order
      teams.forEach(team => {
        if (team.drivers && team.drivers.length > 0) {
          team.drivers.forEach(driverRef => {
            const driverId = driverRef.$oid;
            const driver = allDrivers.find(d => (d._id.$oid || d._id) === driverId);
            if (driver) {
              orderedDrivers.push(driver);
              assignedIds.add(driverId);
            }
          });
        }
      });

      // Add any remaining drivers that might not be assigned to a team
      allDrivers.forEach(driver => {
        const id = driver._id.$oid || driver._id;
        if (!assignedIds.has(id)) {
          orderedDrivers.push(driver);
        }
      });

      setDrivers(orderedDrivers);
    });

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

