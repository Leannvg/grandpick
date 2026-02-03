import { usePagination } from "./../../hooks/usePagination.js";

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
          <option value={teams.length}>Todos</option>
        </select>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className="table-responsive">
        <table className="table">
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

                <td>{t.country}</td>

                <td className="d-flex gap-2">
                  <button onClick={() => onEdit(t._id)}>✏️</button>
                  <button onClick={() => onDelete(t._id, t.name)}>🗑️</button>
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
