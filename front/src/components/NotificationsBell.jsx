import { useNotifications } from "../context/NotificationsContext";
import { Link } from "react-router-dom";

function NotificationsBell() {
  const { notifications, deleteNotification } = useNotifications();
  const unread = notifications.filter(n => !n.seen).length;

  return (
    <>
      <button
        className="nav-link btn btn-link position-relative"
        data-bs-toggle="dropdown"
        aria-label="Notificaciones"
      >
        <svg
          className="icon-submit"
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

      <div className="dropdown-menu dropdown-menu-end notifications-dropdown p-3">
        <p className="dropdown-header">Notificaciones</p>

        <div className="list-group list-group-flush">
          {notifications.length === 0 ? (
            <p className="text-center text-muted py-3 m-0">No hay notificaciones</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="list-group-item list-group-item-action d-flex gap-3 py-3"
              >
                <span className="notification-icon">{n.icon || "🏁"}</span>

                <div className="d-flex gap-2 w-100 justify-content-between">
                  <Link
                    to={n.link}
                    className="text-decoration-none"
                    onClick={() => deleteNotification(n.id)}
                  >
                    <div>
                      <span className="notification-span">{n.title}</span>
                      <p className="notification-p mb-0">{n.message}</p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    className="btn-close notification-close"
                    aria-label="Close"
                    onClick={() => deleteNotification(n.id)}
                  ></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationsBell;
