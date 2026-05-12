import { usePagination } from "./../../hooks/usePagination.js";
import CountryDisplay from "../CountryDisplay.jsx";

export default function TeamsTable({ teams, onEdit, onDelete }) {
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(teams, 10);

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Director</th>
                <th>Motor</th>
                <th>Pilotos</th>
                <th>País</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.chief}</td>
                  <td>{t.power_unit}</td>

                  <td>
                    {t.drivers && t.drivers.length > 0 ? (
                      t.drivers
                        .filter(d => d.active !== false)
                        .map((driver) => (
                          <span
                            key={driver._id || driver}
                            className="badge bg-secondary me-1"
                          >
                            {driver.full_name || driver}
                          </span>
                        ))
                    ) : (
                      <span className="badge bg-secondary me-1">Sin pilotos</span>
                    )}
                  </td>

                  <td>
                    <CountryDisplay iso2={t.country} />
                  </td>

                  <td className="admin-actions">
                    <button className="btn-admin-action btn-admin-edit" onClick={() => onEdit(t._id)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn-admin-action btn-admin-delete" onClick={() => onDelete(t._id, t.name)}>
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
