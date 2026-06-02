import { connectDB } from "../../services/db.services.js";
import { ObjectId } from "mongodb";

export async function getMyNotifications(req, res) {
  try {
    const db = await connectDB();
    const userId = req.usuario.id;

    const notifications = await db
      .collection("user_notifications")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "notifications",
            localField: "notificationId",
            foreignField: "_id",
            as: "notification"
          }
        },
        { $unwind: "$notification" },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    res.json(
      notifications.map(n => ({
        id: n._id,
        title: n.notification.title,
        message: n.notification.message,
        link: n.notification.link,
        type: n.notification.type,
        seen: n.seen,
        createdAt: n.createdAt
      }))
    );
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
}

export async function markAsSeen(req, res) {
  try {
    const db = await connectDB();
    const { id } = req.params;

    await db.collection("user_notifications").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          seen: true,
          seenAt: new Date()
        }
      }
    );

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al marcar notificación como vista:", error);
    res.status(500).json({ error: "Error al marcar notificación" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const db = await connectDB();
    const { id } = req.params;
    const userId = req.usuario.id;

    await db.collection("user_notifications").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId)
    });

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ error: "Error al eliminar notificación" });
  }
}

export async function markAllAsSeen(req, res) {
  try {
    const db = await connectDB();
    const userId = req.usuario.id;

    await db.collection("user_notifications").updateMany(
      { userId: new ObjectId(userId), seen: false },
      {
        $set: {
          seen: true,
          seenAt: new Date()
        }
      }
    );

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al marcar todas las notificaciones como vistas:", error);
    res.status(500).json({ error: "Error al marcar notificaciones" });
  }
}

export async function deleteAllNotifications(req, res) {
  try {
    const db = await connectDB();
    const userId = req.usuario.id;

    await db.collection("user_notifications").deleteMany({
      userId: new ObjectId(userId)
    });

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar todas las notificaciones:", error);
    res.status(500).json({ error: "Error al eliminar notificaciones" });
  }
}

export async function sendAdminNotification(req, res) {
  try {
    const { title, message, link, type, userId } = req.body;
    
    // 1. Crear la notificacion global
    const { createGlobalNotification, assignNotificationToUsers } = await import("../../services/notifications.services.js");
    const notificationId = await createGlobalNotification({ 
      title, 
      message, 
      link: link || "", 
      type: type || "info" 
    });

    const db = await connectDB();
    let users = [];

    if (userId && userId !== "all") {
      const user = await db.collection("Users").findOne({ _id: new ObjectId(userId) });
      if (user) users.push(user);
    } else {
      users = await db.collection("Users").find({}).toArray();
    }

    if (users.length > 0) {
      // 2. Asignar notificacion in-app
      await assignNotificationToUsers(notificationId, users);

      // 3. Enviar notificaciones push
      const { sendPushNotification } = await import("../../services/fcm.services.js");
      let pushEnviadas = 0;
      
      for (const u of users) {
        if (u.fcmTokens && u.fcmTokens.length > 0) {
          try {
            const promesas = u.fcmTokens.map(token => 
              sendPushNotification(token, { title, body: message }, { link: link || "/" })
            );
            await Promise.allSettled(promesas);
            pushEnviadas++;
          } catch (e) {
            console.error("Error enviando push a " + u._id, e);
          }
        }
      }

      res.status(200).json({ 
        message: "Notificación enviada correctamente", 
        inAppCount: users.length, 
        pushCount: pushEnviadas 
      });
    } else {
      res.status(404).json({ message: "No se encontraron usuarios para enviar la notificación" });
    }

  } catch (error) {
    console.error("Error en sendAdminNotification:", error);
    res.status(500).json({ error: "Error al enviar la notificación" });
  }
}

