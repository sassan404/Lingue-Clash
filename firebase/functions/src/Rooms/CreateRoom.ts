import { onRequest } from "firebase-functions/v2/https";
import { CreateRoomRequest } from "../../../../common/Interfaces/Requests";
import { CreateRoomResponse } from "../../../../common/Interfaces/Responses";
import {
  PlayerStates,
  RoundStates,
  RoundTypes,
} from "../../../../common/Interfaces/enums";
import { Reference } from "firebase-admin/database";
import { database } from "../realtime-db.config";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRoom = onRequest(async (request, response) => {
  const { username, language } = request.body as CreateRoomRequest;

  const roomCode = generateRoomCode();

  const roomRef: Reference = database.ref("rooms").push();
  const roomId = roomRef.key as string; // Get the room ID and Assert that it is a string

  const currentTime = Date.now();
  const currentTimestamp = new Date(currentTime);
  const currentTimeISOString = currentTimestamp.toISOString();

  await roomRef.set({
    roomId: roomId,
    roomName: `Room created by ${username}`,
    roomCode: roomCode,
    createdBy: username,
    createdAt: currentTime,
    createdAtTimestamp: currentTimeISOString,
    isLocked: false,
    progress: 0,
    roundCanStart: false,
    countDown: 0,
    currentRound: {
      startAt: currentTime,
      startAtTimestamp: currentTimeISOString,
      state: RoundStates.FINISHED,
      type: RoundTypes.LOBBY,
    },
    currentRoundNumber: 0,
    languages: [language],
    players: {
      [username]: {
        state: PlayerStates.WAITING,
        username: username,
        language: language,
        score: 0,
        joinedAt: currentTime,
        joinedAtTimestamp: currentTimeISOString,
      },
    },
    rounds: {},
  });

  // // Monitor changes to the players array
  // roomRef.child("players").on("value", () => {
  //   updateCanStart(roomRef);
  // });

  // // Monitor changes to the round state flag
  // roomRef.child("currentRound/state").on("value", () => {
  //   updateCanStart(roomRef);
  // });

  // // Monitor changes to the locked flag
  // roomRef.child("isLocked").on("value", () => {
  //   updateCanStart(roomRef);
  // });

  const reponseContent: CreateRoomResponse = { roomCode, roomId };
  response.send(reponseContent);
});

// Function to update canStart
// function updateCanStart(roomRef: Reference) {
//   roomRef.transaction((roomData: RoomContainer) => {
//     if (roomData) {
//       const roomIsLocked = roomData.isLocked;
//       const players: Player[] = Object.values(roomData.players) || [];
//       const playerStates = players.map((player) => player.state);
//       const allPlayersWaiting = playerStates.every(
//         (state) => state === PlayerStates.WAITING,
//       );
//       const roundsStarting =
//         roomData.currentRound.state === RoundStates.STARTING;

//       // Determine if the game can start
//       const canStart =
//         players.length > 1 &&
//         allPlayersWaiting &&
//         !roundsStarting &&
//         !roomIsLocked;

//       roomData.roundCanStart = canStart;
//       // Update canStart in the database
//     }
//     return roomData;
//   });
// }
