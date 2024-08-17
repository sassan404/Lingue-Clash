import { onSchedule } from "firebase-functions/v2/scheduler";
import { database as fireDatabase } from "firebase-functions";
import { database } from "../realtime-db.config";

export const onCreateRoom = fireDatabase
  .ref("/rooms/{roomId}")
  .onCreate(async (_, context) => {
    const roomId = context.params.roomId;
    const createdAt = Date.now();
    const expirationTime = createdAt + 10 * 60 * 1000; // 30 minutes in milliseconds

    // Schedule the room deletion
    const expirationRef = database.ref(`/roomExpirations/${roomId}`);
    await expirationRef.set({
      roomId,
      expiresAt: expirationTime,
    });
    console.log(
      `Room ${roomId} will be deleted at ${new Date(expirationTime)}`,
    );
  });

export const deleteExpiredRooms = onSchedule("every 1 minutes", async () => {
  const now = Date.now();
  const expirationRef = database.ref("/roomExpirations");
  const expiredRoomsSnapshot = await expirationRef
    .orderByChild("expiresAt")
    .endAt(now)
    .once("value");

  const updates: { [key: string]: null } = {};
  expiredRoomsSnapshot.forEach((childSnapshot) => {
    const roomId = childSnapshot.key;
    updates[`/rooms/${roomId}`] = null;
    updates[`/roomExpirations/${roomId}`] = null;
  });

  return database
    .ref()
    .update(updates)
    .then(() => {
      console.log("Expired rooms deleted successfully");
    })
    .catch((error) => {
      console.error("Error deleting expired rooms:", error);
    });
});
