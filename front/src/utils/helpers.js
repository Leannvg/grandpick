import { DateTime } from "luxon";

export function mapRaceToInitialData(apiData) {
  const { circuit, id_circuit, date_gp_start, date_gp_end, race_types } = apiData;

  const enabledPoints = {};
  const pointData = {};

  race_types.forEach((rt) => {
    enabledPoints[rt.points_system._id] = true;

    const dt = DateTime.fromISO(rt.date_race).setZone(circuit.timezone);
    pointData[rt.points_system._id] = {
      fecha: dt.toISODate(),
      hora: dt.toFormat("HH:mm"),
    };
  });

  return {
    circuit: id_circuit,
    circuitTimezone: circuit.timezone,
    dateStart:  DateTime.fromISO(date_gp_start, { zone: "utc" }).toISODate(),
    dateFinish:  DateTime.fromISO(date_gp_end, { zone: "utc" }).toISODate(),
    enabledPoints,
    pointData,
    state: race_types[0]?.state || "Pendiente",
    race_types,
  };
}


export const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};



export function parseErrorMessage(error) {

  if (error?.response?.data?.errors) {
    return error.response.data.errors;
  }


  if (typeof error === "object" && error.message) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.errors) return parsed.errors;
    } catch {
      // no era JSON válido, continuamos
    }
  }


  const msg = error?.message || "Error desconocido";

  if (typeof msg === "string") {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.errors) return parsed.errors;
    } catch {
      // no es JSON válido
    }
  }

  return { general: msg };
}

export function computeRaceState(race) {
    const now = Date.now();
    const start = new Date(race.date_race).getTime();
    const duration = race.totalDuration || 0;
    const end = start + duration;

    // Finalizado
    if (race.state === "Finalizado" || now > end) {
      return { 
        isClosed: true, 
        canPredict: false, 
        isPreWindow: false,
        timeToOpen: null 
      };
    }

    // En curso
    if (now >= start && now <= end) {
      return { 
        isClosed: true, 
        canPredict: false, 
        isPreWindow: false,
        timeToOpen: null 
      };
    }

    const diff = start - now;

    // Faltan ≤ 5 días → ventana abierta
    if (diff <= 5 * 24 * 60 * 60 * 1000) {
      return { 
        isClosed: false, 
        canPredict: true, 
        isPreWindow: false,
        timeToOpen: null 
      };
    }

    // Faltan > 5 días → PRE-WINDOW
    return {
      isClosed: true,
      canPredict: false,
      isPreWindow: true,
      timeToOpen: diff - (5 * 24 * 60 * 60 * 1000)
    };
  }
  
 export function formatRaceDate(startDate, endDate) {
  const months = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];

  const start = new Date(startDate);
  const end = new Date(endDate);

  const dayStart = start.getUTCDate();
  const dayEnd = end.getUTCDate();
  const month = months[start.getUTCMonth()];
  const year = start.getUTCFullYear();

  if (dayStart === dayEnd) {
    return `${dayStart} ${month} ${year}`;
  }

  return `${dayStart}-${dayEnd} ${month} ${year}`;
}


export function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("auth-token");

  return {
    ...extraHeaders,
    ...(token && { "auth-token": token }),
  };
}