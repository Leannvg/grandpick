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
    if (io) io.to(`user:${user._id.toString()}`).emit("notifications:new");
  }

  // ALSO send Push notification
  try {
    const { sendPushToMultipleTokens } = await import("./fcm.services.js");
    const allTokens = users.flatMap(u => u.fcmTokens || []);
    if (allTokens.length > 0) {
      await sendPushToMultipleTokens(allTokens, {
        title: title,
        body: message,
      }, link ? { link } : {});
    }
  } catch(e) {
    console.warn("⚠️ Push no se pudo enviar globalmente", e.message);
  }
}
