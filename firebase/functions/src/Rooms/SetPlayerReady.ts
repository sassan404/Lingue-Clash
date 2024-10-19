import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { LeaveRoomRequest } from "../../../../common/Interfaces/Requests";
import { PlayerStates } from "../../../../common/Interfaces/enums";
import { Player } from "../../../../common/Interfaces/Player";
import { startNewRound } from "./StartNewRound";

export const setPlayerReady = onRequest(async (request, response) => {
  const { roomId, username } = request.body as LeaveRoomRequest;
  const roomRef = database.ref(`rooms/${roomId}`);
  try {
    const roomSnapshot = await roomRef.get();

    if (!roomSnapshot.exists()) {
      console.log("Invalid room code");
      return;
    }

    await roomRef.update({
      isLocked: true,
    });

    console.log(`Setting player: "${username}" as ready in room: "${roomId}"`);

    const playerRef = roomRef.child(`players/${username}`);

    await playerRef.update({
      state: PlayerStates.READY,
    });

    const players: { [playerId: string]: Player } = (
      await roomRef.child("players").get()
    ).val();
    const playersList: Player[] = Object.values(players);
    const allPlayersReady = playersList.every(
      (player: Player) => player.state === PlayerStates.READY,
    );

    if (allPlayersReady) {
      await startNewRound(roomRef);
      for (let playerId of Object.keys(players)) {
        await roomRef.child(`players/${playerId}`).update({
          state: PlayerStates.PLAYING,
        });
      }
    }

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
});
