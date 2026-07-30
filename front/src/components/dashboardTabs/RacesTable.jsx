import { useEffect, useMemo } from "react";
import { usePagination } from "./../../hooks/usePagination.js";
import { formatDateInTimezone } from "../../utils/helpers.js";
import CountryDisplay from "../CountryDisplay.jsx";

export default function RacesTable({ races, onEdit, onDelete, pageSize }) {
  const {
    page,
    pageSize: currentPageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(races, pageSize || 10);

  const now = new Date();
  const upcomingIndex = useMemo(() => {
    if (!races || races.length === 0) return -1;
    return races.findIndex(r => new Date(r.dateEnd) >= now);
  }, [races]);

  useEffect(() => {
    if (races && races.length > 0 && upcomingIndex !== -1) {
      const targetPage = Math.floor(upcomingIndex / (pageSize || 10)) + 1;
      setPage(targetPage);
    }
  }, [races, pageSize, upcomingIndex, setPage]);

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ronda</th>
                <th className="sticky-col">País</th>
                <th>Nombre del circuito</th>
                <th>Fecha de inicio</th>
                <th>Fecha de finalización</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((r) => {
                const isUpcoming = upcomingIndex !== -1 && races[upcomingIndex].gpRaceId === r.gpRaceId;

                return (
                  <tr key={r.gpRaceId} className={isUpcoming ? 'row-upcoming' : ''}>
                    <td>{r.round}</td>
                    <td className="sticky-col"><CountryDisplay iso2={r.country} /></td>
                    <td>{r.gp_name}</td>
                    <td>{formatDateInTimezone(r.dateStart, r.timezone)}</td>
                    <td>{formatDateInTimezone(r.dateEnd, r.timezone)}</td>
                    <td>
                      {(() => {
                        const startDate = new Date(r.dateStart);
                        const endDate = new Date(r.dateEnd);
                        let estado = "";
                        let pillClass = "";

                        if (endDate < now) {
                          estado = "Finalizado";
                          pillClass = "pill-past";
                        } else if (startDate <= now && endDate >= now) {
                          estado = "En curso";
                          pillClass = "pill-current";
                        } else {
                          estado = "Próximamente";
                          pillClass = "pill-upcoming";
                        }

                        return <span className={`admin-status-pill ${pillClass}`}>{estado}</span>;
                      })()}
                    </td>
                    <td className="admin-actions">
                      <button className="btn-admin-action btn-admin-edit" onClick={() => onEdit(r.circuitId, r.year)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn-admin-action btn-admin-delete" onClick={() => onDelete(r.gpRaceId, r.gp_name)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
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
