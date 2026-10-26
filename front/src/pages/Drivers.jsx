import { useEffect, useState } from "react";
import { useLoader } from "../context/LoaderContext";
// import DriverCardDesktop from "../components/drivers/DriverCardDesktop"; // diseño anterior (desktop), reemplazado por DriverCardMobile
import DriverCardMobile from "../components/drivers/DriverCardMobile";
import ReserveDriversSection from "../components/drivers/ReserveDriversSection";
import Reveal from "../components/Reveal";

import TeamsServices from "../services/teams.services";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [reserveDrivers, setReserveDrivers] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  // const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    showLoader();
    TeamsServices.findAllTeams()
      .then((teams) => {
        const activeDriversOrdered = teams.flatMap(team =>
          (team.drivers || [])
            .filter(driver => driver.active === true)
            .map(driver => ({
              ...driver,
              team_id: driver.team_id || driver.team || team._id,
              team_info: team
            }))
        );

        setDrivers(activeDriversOrdered);

        // TODO: reemplazar por los suplentes cargados desde el panel de control
        const mocks = [
          { full_name: "Ayumu Iwasa", trigram: "IWA", country: "JP" },
          { full_name: "Frederik Vesti", trigram: "VES", country: "DK" },
          { full_name: "Felipe Drugovich", trigram: "DRU", country: "BR" },
        ];
        setReserveDrivers(
          mocks.map((m, i) => ({ ...m, _id: `reserve-mock-${i}`, team_info: teams[i] }))
            .filter(m => m.team_info)
        );
      })
      .catch(err => {
        console.error("Error loading drivers:", err);
      })
      .finally(() => {
        hideLoader();
      });

    // Diseño anterior (desktop vs mobile): ya no hace falta detectar el ancho
    // const handleResize = () => {
    //   setIsMobile(window.innerWidth < 768);
    // };
    //
    // window.addEventListener("resize", handleResize);
    // return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <div className="drivers-page page-wrapper">
      <section className="page-section container text-center">
        <header className="page-header">
          <p className="section-label">Temporada actual</p>
          <h1 className="section-title">PILOTOS</h1>
          <p className="section-subtitle">Los verdaderos protagonistas de la pista</p>
        </header>

        <div className="drivers-cards-grid">
          {drivers.map((driver, index) => (
            <Reveal key={driver._id.$oid} delay={Math.min(index * 0.05, 0.4)}>
              <DriverCardMobile driver={driver} />
              {/* Diseño anterior (desktop):
              {isMobile ? (
                <DriverCardMobile driver={driver} />
              ) : (
                <DriverCardDesktop driver={driver} />
              )} */}
            </Reveal>
          ))}
        </div>

        <ReserveDriversSection drivers={reserveDrivers} />
      </section>
    </div>
  );
}

export default Drivers;

