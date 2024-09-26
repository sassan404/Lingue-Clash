import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { Reference } from "@firebase/database-types";
import {
  Languages,
  LeaveRoomRequest,
  Player,
  PlayerStates,
  RoomStates,
  RoundStates,
} from "../../../../common/Interfaces/Interfaces";
import { giveMeWords } from "../ChatGPT/giveMeWords";

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

  const players: { [playerId: string]: Player } = (
    await roomRef.child("players").once("value")
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

const startNewRound = async (roomRef: Reference) => {
  await roomRef.update({
    state: RoomStates.READY,
  });
  const currentRound = (
    await roomRef.child("currentRound").once("value")
  ).val();
  console.log("Current round: ", currentRound);
  const newRound = currentRound + 1;
  await roomRef.update({ currentRound: newRound });
  const roundRef = roomRef.child(`rounds/${newRound}`);
  roundRef.set({
    startAt: Date.now(),
    startAtTimestamp: new Date().toISOString(),
    countDown: 5,
    state: RoundStates.STARTING,
  });

  await roomRef
    .child("languages")
    .once("value")
    .then((snapshot) => {
      const languages: Languages = {
        wordNumber: newRound,
        languages: snapshot.val(),
      };
      giveMeWords(languages).then((words) => {
        roundRef.update({ givenWords: words });
      });
    });

  let count = 5;
  const intervalId = setInterval(() => {
    count--;
    roundRef.update({ countDown: count });
    if (count <= 0) {
      clearInterval(intervalId);
    }
  }, 1000);
  roundRef.update({ state: RoundStates.PLAYING });
  roomRef.update({ locked: true });
};
