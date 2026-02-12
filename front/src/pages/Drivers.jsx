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
      <h2>Pilotos</h2>
      <ul>
        {drivers.map(({ _id, full_name }) => (
          <li key={_id}>{full_name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Drivers;
