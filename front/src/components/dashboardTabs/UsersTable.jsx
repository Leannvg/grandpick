import { usePagination } from "./../../hooks/usePagination.js";
import { formatDate } from "../../utils/helpers.js";
import CountryDisplay from "../CountryDisplay.jsx";

export default function UsersTable({ users, onToggleBlock }) {
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(users, 10);

  return (
    <>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Puntos</th>
              <th>País</th>
              <th>Registrado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((u) => (
              <tr key={u._id}>
                <td>{`${u.name} ${u.last_name}`}</td>
                <td>{u.email}</td>
                <td>{u.points}</td>
                <td><CountryDisplay iso2={u.country} /></td>
                <td>{formatDate(u.date_register)}</td>
                <td className="admin-actions">
                  <button
                    onClick={() => onToggleBlock(u)}
                    className={`btn-admin-action ${u.blocked ? "btn-admin-add" : "btn-admin-delete"}`}
                    title={u.blocked ? "Desbloquear" : "Bloquear"}
                  >
                    <i className={`bi ${u.blocked ? "bi-lock-fill" : "bi-unlock-fill"}`}></i>
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
