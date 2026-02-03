import * as usersServices from './users.services.js'
import { createGlobalNotification, assignNotificationToUsers} from "./notifications.services.js";

export async function sendGlobalNotification(app, {
  title,
  message,
  link = null,
  type = "info"
}) {
  const io = app.get("io");

  if (!io) {
    console.warn("⚠️ Socket.io no inicializado");
    return;
  }

  const users = await usersServices.getUsers();
  if (!users.length) return;

  const notificationId =
    await createGlobalNotification({
      title,
      message,
      link,
      type
    });

  await assignNotificationToUsers(
    notificationId,
    users
  );

  for (const user of users) {
    io.to(`user:${user._id.toString()}`).emit("notifications:new");
  }
}
