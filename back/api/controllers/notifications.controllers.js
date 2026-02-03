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

