import { usePagination } from "./../../hooks/usePagination.js";
import { getFlagEmoji } from "./../../utils/helpers.js";

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
          <option value={drivers.length}>Todos</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table">
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
                  <span className="emoji-flag me-1">{getFlagEmoji(d.country)}</span>
                  {d.country}
                </td>
                <td>{d.team_info?.name || "Sin escudería"}</td>
                <td>{d.active ? "🟢" : "🔴"}</td>

                <td className="d-flex gap-2">
                  <button onClick={() => onEdit(d._id)}>✏️</button>
                  <button onClick={() => onDelete(d._id, d.full_name)}>🗑️</button>
                  <button
                    onClick={() => onToggle(d)}
                    className={`btn ${d.active ? "btn-danger" : "btn-success"}`}
                  >
                    {d.active ? "Deshabilitar" : "Habilitar"}
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
