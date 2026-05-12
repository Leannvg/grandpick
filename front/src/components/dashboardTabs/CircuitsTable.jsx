import { usePagination } from "./../../hooks/usePagination.js";
import CountryDisplay from "../CountryDisplay.jsx";

export default function CircuitsTable({ circuits, onEdit, onDelete }) {
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(circuits, 10);

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Longitud</th>
                <th>Vueltas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((c) => (
                <tr key={c._id}>
                  <td>{c.circuit_name}</td>
                  <td>
                    <CountryDisplay iso2={c.country} />
                  </td>
                  <td>{c.length}</td>
                  <td>{c.laps}</td>
                  <td className="admin-actions">
                    <button className="btn-admin-action btn-admin-edit" onClick={() => onEdit(c._id)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="btn-admin-action btn-admin-delete" onClick={() => onDelete(c._id, c.circuit_name)}>
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
