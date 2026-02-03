import { ObjectId } from "mongodb";
import { connectDB } from "../services/db.services.js";

export async function createGlobalNotification({ title, message, link, type }) {
  const db = await connectDB();

  const result = await db.collection("notifications").insertOne({
    title,
    message,
    link,
    type,
    createdAt: new Date()
  });

  return result.insertedId;
}

export async function assignNotificationToUsers(notificationId, users) {
  const db = await connectDB();

  const docs = users.map(user => ({
    userId: new ObjectId(user._id),
    notificationId: new ObjectId(notificationId),
    seen: false,
    createdAt: new Date()
  }));

  if (docs.length) {
    await db.collection("user_notifications").insertMany(docs);
  }
}

