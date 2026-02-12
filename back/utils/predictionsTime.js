export function getPredictionsOpenAt(dateRace, hoursBefore = 24) {
  return new Date(
    new Date(dateRace).getTime() - hoursBefore * 60 * 60 * 1000
  );
}
