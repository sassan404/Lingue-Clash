import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import {
  LeaveRoomRequest,
  Player,
  PlayerStates,
  RoomStates,
} from "../Interfaces/interfaces";

export const setPlayerReady = onRequest(async (request, response) => {
  console.log("request.body: ", request.body);
  const { roomId, username } = request.body as LeaveRoomRequest;

  const roomRef = database.ref(`rooms/${roomId}`);
  const roomSnapshot = await roomRef.once("value");

  if (!roomSnapshot.exists()) {
    console.log("Invalid room code");
    return;
  }

  roomSnapshot.ref.update({
    state: RoomStates.LOADING,
  });

  console.log(`Setting player: "${username}" as ready in room: "${roomId}"`);
  const playerRef = database.ref(`rooms/${roomId}/players/${username}`);

  await playerRef.update({
    state: PlayerStates.READY,
  });

  const players = roomSnapshot.val().players;
  const playersList: Player[] = Object.values(players);
  const allPlayersReady = playersList.every(
    (player: { state: PlayerStates }) => player.state === PlayerStates.READY,
  );
  if (allPlayersReady) {
    roomRef.update({
      state: RoomStates.READY,
    });
  } else {
    roomRef.update({
      state: RoomStates.WAITING,
    });
  }

  const responseContent = `Player: "${username}" is ready in room: "${roomId}"`;
  console.log(responseContent);

  response.send(responseContent);
});
