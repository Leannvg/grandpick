import { useNotifications } from "../context/NotificationsContext";
import { Link } from "react-router-dom";

function NotificationsBell({ onToggle }) {
  const { notifications, deleteNotification, markAsSeen, markAllAsSeen, deleteAllNotifications } = useNotifications();
  const unread = notifications.filter(n => !n.seen).length;

  return (
    <>
      <button
        className="nav-link btn btn-link position-relative"
        data-bs-toggle="dropdown"
        aria-label="Notificaciones"
        onClick={onToggle}
      >
        <svg
          className={`icon-submit ${unread > 0 ? "unread" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>

      <div className="dropdown-menu dropdown-menu-end notifications-dropdown shadow-lg">
        <div className="notifications-header p-3 border-bottom d-flex justify-content-between align-items-center">
          <p className="dropdown-header m-0 p-0 text-dark fw-bold">Notificaciones</p>
          {notifications.length > 0 && (
            <div className="d-flex gap-2 align-items-center">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small text-primary fw-semibold"
                style={{ fontSize: "12px", border: "none", background: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  markAllAsSeen();
                }}
              >
                Marcar leídas
              </button>
              <span className="text-muted small" style={{ fontSize: "10px" }}>|</span>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none small text-danger fw-semibold"
                style={{ fontSize: "12px", border: "none", background: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteAllNotifications();
                }}
              >
                Limpiar todas
              </button>
            </div>
          )}
        </div>

        <div className="notifications-body">
          <div className="list-group list-group-flush">
            {notifications.length === 0 ? (
              <p className="text-center py-4 m-0 text-muted small">No hay notificaciones</p>
            ) : (
              notifications.map((n) => {
                const hasLink = !!n.link;
                const linkTarget = n.link?.startsWith("/results") ? "/prediction-history" : n.link;

                const content = (
                  <>
                    <span className="notification-icon fs-4">{n.icon || "🏁"}</span>
                    <div className="notification-content">
                      <div className="d-flex align-items-center gap-2">
                        <span className="notification-title fw-semibold text-dark">{n.title}</span>
                        {!n.seen && <span className="notification-unread-dot"></span>}
                      </div>
                      <p className="notification-message mb-0 text-muted small">{n.message}</p>
                    </div>
                  </>
                );

                const handleClick = () => {
                  if (!n.seen) {
                    markAsSeen(n.id);
                  }
                };

                return (
                  <div
                    key={n.id}
                    className={`notification-item-wrapper position-relative border-bottom ${!n.seen ? "unread" : ""}`}
                  >
                    {hasLink ? (
                      <Link
                        to={linkTarget}
                        className="notification-item d-flex gap-3 p-3 pe-5 text-decoration-none"
                        onClick={handleClick}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        className="notification-item d-flex gap-3 p-3 pe-5 text-decoration-none"
                        style={{ cursor: "pointer" }}
                        onClick={handleClick}
                      >
                        {content}
                      </div>
                    )}

                    <button
                      type="button"
                      className="notification-close-btn"
                      aria-label="Borrar notificación"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationsBell;
