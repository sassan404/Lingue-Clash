import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { LeaveRoomRequest } from "../../../front/common/Interfaces/Requests";
import { PlayerStates } from "../../../front/common/Interfaces/enums";

export const setPlayerReady = onRequest(
  { cors: true },
  async (request, response) => {
    const { roomId, username } = request.body as LeaveRoomRequest;
    const roomRef = database.ref(`rooms/${roomId}`);
    try {
      const roomSnapshot = await roomRef.once("value");

      if (!roomSnapshot.exists()) {
        console.log("Invalid room code");
        return;
      }

      await roomRef.update({
        isLocked: true,
      });

      const playerRef = roomRef.child(`players/${username}`);

      await playerRef.update({
        state: PlayerStates.READY,
      });

      await roomRef.update({
        isLocked: false,
      });

      const responseContent = {
        success: `Player: "${username}" is ready in room: "${roomId}"`,
      };

      response.send(responseContent);
    } catch (error) {
      console.error("Error setting player ready: ", error);
      await roomRef.update({
        isLocked: false,
      });
      response.send({ error: error });
    }
  },
);
