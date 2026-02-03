import { useNotifications } from "../context/NotificationsContext";
import { Link } from "react-router-dom";
import { useState } from "react";

function NotificationsBell() {
  const { notifications, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);

  const unread = notifications.filter(n => !n.seen).length;

  return (
    <div className="notifications">
      <button className="bell" onClick={() => setOpen(o => !o)}>
        🔔 {unread > 0 && <span className="badge">{unread}</span>}
      </button>

      {open && (
        <div className="dropdown">
          {notifications.map(n => (
            <div key={n.id} className="item">
              <div className="header">
                <strong>{n.title}</strong>

                <button
                  className="close"
                  onClick={() => deleteNotification(n.id)}
                >
                  ✕
                </button>
              </div>

              <p>{n.message}</p>

              <Link
                to={n.link}
                onClick={() => {
                  deleteNotification(n.id);
                  setOpen(false);
                }}
              >
                Ver
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsBell;
