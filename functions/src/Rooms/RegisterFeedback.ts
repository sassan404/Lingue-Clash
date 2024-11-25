import { onRequest } from "firebase-functions/v2/https";
import { FeedBackRequest } from "../../../front/common/Interfaces/Requests";
import { Reference } from "firebase-admin/database";
import { database } from "../realtime-db.config";
import { warn } from "firebase-functions/logger";

export const registerFeedback = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      let { playerId, roomId, message } = request.body as FeedBackRequest;

      const feedbackRef: Reference = database.ref("feedback").push();

      const currentTime = Date.now();
      const currentTimestamp = new Date(currentTime);
      const currentTimeISOString = currentTimestamp.toISOString();

      await feedbackRef.set({
        roomId: roomId,
        playerId: playerId,
        message: message,
        createdAt: currentTime,
        createdAtTimestamp: currentTimeISOString,
      });

      response.send("Feedback received");
    } catch (error) {
      warn((error as Error).message);
      response.status(500).send(error);
    }
  },
);
