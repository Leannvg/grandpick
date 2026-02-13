import { useEffect, useState } from "react";
import DriversServices from "../services/drivers.services";
import DriverCardDesktop from "../components/drivers/DriverCardDesktop";
import DriverCardMobile from "../components/drivers/DriverCardMobile";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    DriversServices.findAll().then((data) => {
      setDrivers(data);
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

