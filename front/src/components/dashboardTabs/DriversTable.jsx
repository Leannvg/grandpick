import { usePagination } from "./../../hooks/usePagination.js";
import CountryDisplay from "../CountryDisplay.jsx";

export default function DriversTable({ drivers, onEdit, onDelete, onToggle }) {
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(drivers, 10);

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Trigrama</th>
                <th>Número</th>
                <th>País</th>
                <th>Escudería</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((d) => (
                <tr key={d._id}>
                  <td>{d.full_name}</td>
                  <td>{d.trigram}</td>
                  <td>{d.number}</td>
                  <td>
                    <CountryDisplay iso2={d.country} />
                  </td>
                  <td>{d.team_info?.name || "Sin escudería"}</td>
                  <td>
                    {d.active ? (
                      <span className="badge bg-success">Habilitado</span>
                    ) : (
                      <span className="badge bg-danger">Deshabilitado</span>
                    )}
                  </td>

                  <td className="admin-actions">
                    <button className="btn-admin-action btn-admin-edit" onClick={() => onEdit(d._id)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn-admin-action btn-admin-delete" onClick={() => onDelete(d._id, d.full_name)}>
                      <i className="bi bi-trash-fill"></i>
                    </button>
                    <button
                      onClick={() => onToggle(d)}
                      className={`btn-admin-action ${d.active ? "btn-admin-delete" : "btn-admin-add"}`}
                      title={d.active ? "Deshabilitar" : "Habilitar"}
                    >
                      <i className={`bi ${d.active ? "bi-person-x-fill" : "bi-person-check-fill"}`}></i>
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
