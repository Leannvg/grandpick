import { usePagination } from "./../../hooks/usePagination.js";
import { formatDateInTimezone } from "../../utils/helpers.js";
import CountryDisplay from "../CountryDisplay.jsx";

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
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
          <thead>
            <tr>
              <th>Ronda</th>
              <th>País</th>
              <th>Nombre del circuito</th>
              <th>Fecha de inicio</th>
              <th>Fecha de finalización</th>
              <th>Tipos de carreras</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((r) => (
              <tr key={r.gpRaceId}>
                <td>{r.round}</td>
                <td><CountryDisplay iso2={r.country} /></td>
                <td>{r.gp_name}</td>
                <td>{formatDateInTimezone(r.dateStart, r.timezone)}</td>
                <td>{formatDateInTimezone(r.dateEnd, r.timezone)}</td>
                <td>{r.raceTypes}</td>
                <td className="admin-actions">
                  <button className="btn-admin-action btn-admin-edit" onClick={() => onEdit(r.circuitId, r.year)}>
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button className="btn-admin-action btn-admin-delete" onClick={() => onDelete(r.gpRaceId, r.gp_name)}>
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {/* PAGINACIÓN EXTERNA */}
      <div className="admin-pagination">
        <span className="page-info">{page} / {totalPages}</span>
        <div className="d-flex gap-2">
          <button className="btn-pagination" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <button className="btn-pagination" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </>
  );
}
