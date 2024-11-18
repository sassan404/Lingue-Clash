import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { LeaveRoomRequest } from "../../../front/common/Interfaces/Requests";
import { PlayerStates } from "../../../front/common/Interfaces/enums";
import { warn } from "firebase-functions/logger";
import { setRoundCanStartIfAllPlayersReady } from "./Helpers/PlayerStateHelper";

export const setPlayerReady = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    const { roomId, username } = request.body as LeaveRoomRequest;
    const roomRef = database.ref(`rooms/${roomId}`);
    try {
      const roomSnapshot = await roomRef.once("value");

      if (!roomSnapshot.exists()) {
        throw new HttpsError("not-found", "Room does not exist");
      }

      const playerStateRef = roomRef.child(`players/${username}/state`);

      // I need this listener to trigger the transaction with the correct value
      const playerState = await playerStateRef.once("value");

      if (playerState.val() === PlayerStates.READY) {
        throw new HttpsError("already-exists", "Player is already ready");
      }

      await playerStateRef.set(PlayerStates.READY);

      setRoundCanStartIfAllPlayersReady(roomRef);

      const responseContent = {
        success: `Player: "${username}" is ready in room: "${roomId}"`,
      };

      response.send(responseContent);
    } catch (error) {
      warn((error as Error).message);
      response.status(500).send(error);
    }
  },
);
