import { useNotifications } from "../context/NotificationsContext";
import { Link } from "react-router-dom";

function NotificationsBell({ onToggle }) {
  const { notifications, deleteNotification } = useNotifications();
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
        <div className="notifications-header p-3 border-bottom">
          <p className="dropdown-header m-0 p-0 text-dark fw-bold">Notificaciones</p>
        </div>

        <div className="notifications-body">
          <div className="list-group list-group-flush">
            {notifications.length === 0 ? (
              <p className="text-center py-4 m-0">No hay notificaciones</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="notification-item-wrapper position-relative border-bottom"
                >
                  <Link
                    to={n.link?.startsWith("/results") ? "/prediction-history" : (n.link || "/predictions")}
                    className="notification-item d-flex gap-3 p-3 text-decoration-none"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <span className="notification-icon fs-4">{n.icon || "🏁"}</span>
                    <div className="notification-content">
                      <span className="notification-title fw-semibold text-dark d-block">{n.title}</span>
                      <p className="notification-message mb-0 text-muted small">{n.message}</p>
                    </div>
                  </Link>

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
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationsBell;
