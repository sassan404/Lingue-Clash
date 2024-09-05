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

  await roomSnapshot.ref.update({
    state: RoomStates.LOADING,
  });

  console.log(`Setting player: "${username}" as ready in room: "${roomId}"`);
  const playerRef = database.ref(`rooms/${roomId}/players/${username}`);

  await playerRef.update({
    state: PlayerStates.READY,
  });

  const players = (await roomRef.child("players").once("value")).val();
  const playersList: Player[] = Object.values(players);
  const allPlayersReady = playersList.every(
    (player: { state: PlayerStates }) => player.state === PlayerStates.READY,
  );

  if (allPlayersReady) {
    await roomRef.update({
      state: RoomStates.READY,
    });
    const currentRound = (
      await roomRef.child("currentRound").once("value")
    ).val();
    console.log("Current round: ", currentRound);
    await roomRef.update({ currentRound: currentRound + 1 });
    const roundRef = roomRef.child(`rounds/${currentRound}`);
    roundRef.set({
      startAt: Date.now(),
      startAtTimestamp: new Date().toISOString(),
      countDown: 5,
    });
    let count = 5;
    const intervalId = setInterval(() => {
      count--;
      roundRef.update({ countDown: count });
      if (count <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);
  } else {
    await roomRef.update({
      state: RoomStates.WAITING,
    });
  }

  const responseContent = {
    success: `Player: "${username}" is ready in room: "${roomId}"`,
  };

  response.send(responseContent);
});
