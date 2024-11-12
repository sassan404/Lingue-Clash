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

      const playerStateRef = roomRef.child(`players/${username}/state`);

      await playerStateRef.transaction((state) => {
        if (state) {
          state = PlayerStates.READY;
        }
        return state;
      });

      const responseContent = {
        success: `Player: "${username}" is ready in room: "${roomId}"`,
      };

      response.send(responseContent);
    } catch (error) {
      console.error("Error setting player ready: ", error);
      response.send({ error: error });
    }
  },
);
