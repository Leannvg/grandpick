import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePagination } from "./../../hooks/usePagination.js";
import { formatDate } from "../../utils/helpers.js";
import CountryDisplay from "../CountryDisplay.jsx";

export default function UsersTable({ users, onToggleBlock, pageSize }) {
  const reduceMotion = useReducedMotion();
  const {
    page,
    pageSize: currentPageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData
  } = usePagination(users, pageSize || 10);

  return (
    <>
      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="sticky-col">Nombre</th>
                <th>Email</th>
                <th>Puntos</th>
                <th>País</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence initial={false}>
              {paginatedData.map((u) => (
                <motion.tr
                  key={u._id}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                >
                  <td className="sticky-col">{`${u.name} ${u.last_name}`}</td>
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
