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
              <th>Acciones administrador</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((r) => (
              <tr key={r.gpRaceId}>
                <td>{r.round}</td>
                <td>{r.country}</td>
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

      {/* PAGINACIÓN */}
      <div className="mt-3 d-flex justify-content-end gap-2 align-items-center p-2">
        <button className="admin-tab-btn" style={{padding: '4px 12px'}} disabled={page === 1} onClick={() => setPage(page - 1)}>◀</button>
        <span style={{color: '#333'}}>{page} / {totalPages}</span>
        <button className="admin-tab-btn" style={{padding: '4px 12px'}} disabled={page === totalPages} onClick={() => setPage(page + 1)}>▶</button>
      </div>
    </>
  );
}
