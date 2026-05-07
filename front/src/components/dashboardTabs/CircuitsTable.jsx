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
          <option value={circuits.length}>Todos</option>
        </select>
      </div>
      <div className="table-responsive">
        <table className="table">
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
                <td>
                  <button onClick={() => onEdit(c._id)}>✏️</button>
                  <button onClick={() => onDelete(c._id, c.circuit_name)}>🗑️</button>
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
