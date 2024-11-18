import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { warn } from "firebase-functions/logger";
import { StartRoundHelper } from "./Helpers/StartRoundHelper";
import { RoundStates } from "../../../front/common/Interfaces/enums";

export const startNewRound = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      const { roomId } = request.body;
      const roomRef = database.ref(`rooms/${roomId}`);
      const roomSnapshot = await roomRef.once("value");

      if (!roomSnapshot.exists()) {
        throw new HttpsError("not-found", "Room does not exist");
      }

      const roundStateRef = await roomRef
        .child("currentRound/state")
        .once("value");

      if (roundStateRef.val() === RoundStates.PLAYING) {
        throw new HttpsError("invalid-argument", "Round is already playing");
      }

      new StartRoundHelper(roomRef).startNewRound();

      const responseContent = {
        success: `Round is starting in room: "${roomId}"`,
      };

      response.send(responseContent);
    } catch (error) {
      warn((error as Error).message);
      response.status(500).send(error);
    }
  },
);
