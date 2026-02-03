import { usePagination } from "./../../hooks/usePagination.js";
import { formatDate } from "../../utils/helpers.js";

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
          <option value={users.length}>Todos</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table">
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
                <td>{u.country}</td>
                <td>{formatDate(u.date_register)}</td>
                <td>
                  <button
                    onClick={() => onToggleBlock(u)}
                    className={`btn ${u.blocked ? "btn-success" : "btn-danger"}`}
                  >
                    {u.blocked ? "🔓 Desbloquear" : "🚫 Bloquear"}
                  </button>
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
