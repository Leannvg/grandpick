import { DateTime } from "luxon";

export function mapRaceToInitialData(apiData) {
  const { circuit, id_circuit, date_gp_start, date_gp_end, race_types } = apiData;

  const enabledPoints = {};
  const pointData = {};
  const tz = circuit?.timezone || "UTC";

  race_types.forEach((rt) => {
    enabledPoints[rt.points_system._id] = true;

    const dt = DateTime.fromISO(rt.date_race).setZone(tz);
    pointData[rt.points_system._id] = {
      fecha: dt.toISODate(),
      hora: dt.toFormat("HH:mm"),
    };
  });

  return {
    circuit: id_circuit,
    circuitTimezone: tz,
    dateStart: DateTime.fromISO(date_gp_start).setZone(tz).toISODate(),
    dateFinish: DateTime.fromISO(date_gp_end).setZone(tz).toISODate(),
    enabledPoints,
    pointData,
    state: race_types[0]?.state || "Pendiente",
    race_types,
  };
}


export const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  return DateTime.fromISO(isoDate).setZone("local").toFormat("dd/MM/yyyy");
};

export const formatDateInTimezone = (isoDate, timezone = "utc") => {
  if (!isoDate) return "N/A";
  return DateTime.fromISO(isoDate).setZone(timezone).toFormat("dd/MM/yyyy");
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
  const duration = race.totalDuration || 7200000; // 2 horas por defecto (ms)
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

export function formatRaceDate(startDate, endDate, timezone = "local") {
  const months = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];

  if (!startDate || !endDate) return "N/A";

  const start = DateTime.fromISO(startDate).setZone(timezone);
  const end = DateTime.fromISO(endDate).setZone(timezone);

  const dayStart = start.day;
  const dayEnd = end.day;
  const month = months[start.month - 1];
  const year = start.year;

  if (dayStart === dayEnd) {
    return `${dayStart} ${month}`;
  }

  return `${dayStart}-${dayEnd} ${month}`;
}



export function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("auth-token");

  return {
    ...extraHeaders,
    ...(token && { "auth-token": token }),
  };
}

export function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return countryCode;
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}