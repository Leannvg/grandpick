import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePagination } from "./../../hooks/usePagination.js";
import CountryDisplay from "../CountryDisplay.jsx";

export default function CircuitsTable({ circuits, onEdit, onDelete, pageSize }) {
  const reduceMotion = useReducedMotion();
  const {
    page,
    pageSize: currentPageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(circuits, pageSize || 10);

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="sticky-col">País</th>
                <th>Longitud</th>
                <th>Vueltas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false} mode="popLayout">
              {paginatedData.map((c) => (
                <motion.tr
                  key={c._id}
                  layout
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  <td>{c.circuit_name}</td>
                  <td className="sticky-col">
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
                </motion.tr>
              ))}
              </AnimatePresence>
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
