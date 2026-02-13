import { useEffect, useState } from "react";
import DriversServices from "../services/drivers.services";
import DriverCardDesktop from "../components/drivers/DriverCardDesktop";
import DriverCardMobile from "../components/drivers/DriverCardMobile";

import TeamsServices from "../services/teams.services";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      TeamsServices.findAllTeams(),
      DriversServices.findAll()
    ]).then(([teams, allDrivers]) => {
      // 1. Filter only active drivers first
      const activeDrivers = allDrivers.filter(d => d.active === true);

      const orderedDrivers = [];
      const assignedIds = new Set();

      // 2. Group active drivers by team order
      teams.forEach(team => {
        if (team.drivers && team.drivers.length > 0) {
          team.drivers.forEach(driverRef => {
            const driverId = driverRef.$oid || driverRef; // Handle potential variations
            const driver = activeDrivers.find(d => {
              const currentId = d._id.$oid || d._id;
              return currentId === driverId;
            });

            if (driver && !assignedIds.has(driverId)) {
              orderedDrivers.push(driver);
              assignedIds.add(driverId.toString()); // Store as string for Set reliability
            }
          });
        }
      });

      // 3. Add any remaining active drivers not in team list
      activeDrivers.forEach(driver => {
        const id = (driver._id.$oid || driver._id).toString();
        if (!assignedIds.has(id)) {
          orderedDrivers.push(driver);
        }
      });

      setDrivers(orderedDrivers);
      setLoading(false);
    }).catch(err => {
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

