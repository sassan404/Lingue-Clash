import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import {
  CreateRoomRequest,
  CreateRoomResponse,
  PlayerStates,
  RoundContainer,
  RoomStates,
  RoundStates,
  RoomContainer,
} from "../../../../common/Interfaces/Interfaces";
import { Reference } from "firebase-admin/database";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// // Example usage
// createRoom("user1", "French").then(({roomId, roomCode}) => {
//   console.log(`Room ID: ${roomId}, Room Code: ${roomCode}`);
// });

export const createRoom = onRequest(async (request, response) => {
  console.log("request.body: ", request.body);
  const { username, language } = request.body as CreateRoomRequest;

  console.log(`Creating room for ${username} with language ${language}`);

  const roomCode = generateRoomCode();

  const roomRef: Reference = database.ref("rooms").push();
  const roomId = roomRef.key as string; // Get the room ID and Assert that it is a string

  const currentTime = Date.now();
  const currentTimestamp = new Date(currentTime);

  await roomRef.set({
    roomName: `Room created by ${username}`,
    createdAt: currentTime,
    createdAtTimestamp: currentTimestamp.toISOString(),
    createdBy: username,
    roundCanStart: false,
    currentRound: 0,
    roomCode: roomCode,
    state: RoomStates.WAITING,
    languages: [language],
    players: {
      [username]: {
        state: PlayerStates.WAITING,
        username,
        language,
        score: 0,
        joinedAt: currentTime,
        joinedAtTimestamp: currentTimestamp.toISOString(),
      },
    },
    rounds: {},
  });
  console.log(`Room created with code: ${roomCode} and ID: ${roomId}`);

  // Monitor changes to the players array
  roomRef.child("players").on("value", (snapshot) => {
    updateCanStart(roomRef);
  });

  // Monitor changes to the round state flag
  roomRef.child("rounds").on("value", (snapshot) => {
    updateCanStart(roomRef);
  });

  // Monitor changes to the state flag
  roomRef.child("state").on("value", (snapshot) => {
    updateCanStart(roomRef);
  });

  const reponseContent: CreateRoomResponse = { roomCode, roomId };
  response.send(reponseContent);
});

// Function to update canStart based on players and roundStarted
function updateCanStart(roomRef: Reference) {
  roomRef.once("value").then((snapshot) => {
    const roomData: RoomContainer = snapshot.val();
    const roomState = roomData.state;
    const players = Object.keys(roomData.players) || [];
    const roundsOnGoing = roomData.rounds
      ? Object.values(roomData.rounds).every((element: RoundContainer) => {
          return element.state != RoundStates.FINISHED;
        })
      : false;

    // Determine if the game can start
    const canStart =
      players.length > 1 && !roundsOnGoing && roomState != RoomStates.LOADING;

    // Update canStart in the database
    roomRef.update({ roundCanStart: canStart });
  });
}
