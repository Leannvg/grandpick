import { usePagination } from "./../../hooks/usePagination.js";
import { formatDateInTimezone } from "../../utils/helpers.js";

export default function RacesTable({ races, onEdit, onDelete }) {
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(races, 10);

  return (
    <>
      {/* SELECT PAGE SIZE */}
      <div className="d-flex justify-content-start mb-2">
        <label className="me-2">Mostrar:</label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="form-select"
          style={{ width: "100px" }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={races.length}>Todos</option>
        </select>
      </div>

      {/* RESPONSIVE TABLE */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Año</th>
              <th>Ronda</th>
              <th>País</th>
              <th>Gran Premio</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Tipos</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((r) => (
              <tr key={r.gpRaceId}>
                <td>{r.year}</td>
                <td>{r.round}</td>
                <td>{r.country}</td>
                <td>{r.gp_name}</td>
                <td>{formatDateInTimezone(r.dateStart, r.timezone)}</td>
                <td>{formatDateInTimezone(r.dateEnd, r.timezone)}</td>
                <td>{r.raceTypes}</td>
                <td>
                  <button onClick={() => onEdit(r.circuitId, r.year)}>✏️</button>
                  <button onClick={() => onDelete(r.gpRaceId, r.gp_name)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="mt-2 d-flex justify-content-end gap-2 align-items-center">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>◀</button>
        <span>{page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>▶</button>
      </div>
    </>
  );
}
