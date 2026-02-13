import { useEffect, useState } from "react";
import DriversServices from "../services/drivers.services";

function Drivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    DriversServices.findAll().then((data) => {
      setDrivers(data);
    });
  }, []);

  return (
    <div>
      <section class="drivers-section text-center page-section container">
       <header class="page-header">
            <p class="section-label">Temporada actual</p>
            <h1 class="section-title">PILOTOS</h1>
            <p class="section-subtitle">Los verdaderos protagonistas de la pista</p>
        </header>

        <ul>
          {drivers.map(({ _id, full_name }) => (
            <li key={_id}>{full_name}</li>
          ))}
        </ul>

      </section>
    </div>
  );
}

export default Drivers;
