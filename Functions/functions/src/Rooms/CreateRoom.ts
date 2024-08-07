import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// // Example usage
// createRoom("user1", "French").then(({roomId, roomCode}) => {
//   console.log(`Room ID: ${roomId}, Room Code: ${roomCode}`);
// });

export const createRoom = onRequest(async (request, response) => {
  console.log("request.body: ", request.body);
  const { username, language } = request.body as CreateRequest;

  console.log(`Creating room for ${username} with language ${language}`);

  const roomCode = generateRoomCode();

  const roomRef = database.ref("rooms").push();
  const roomId = roomRef.key as string; // Get the room ID and Assert that it is a string

  const currentTime = Date.now();

  // Generate a unique player ID
  const playerRef = roomRef.child("players").push();
  const playerId = playerRef.key as string;

  await roomRef.set({
    roomName: `Room created by ${username}`,
    createdAt: currentTime,
    createdBy: username,
    currentRound: 0,
    roomCode,
    players: {
      [playerId]: {
        username,
        language,
        score: 0,
        joinedAt: currentTime,
      },
    },
    rounds: {},
  });
  console.log(`Room created with code: ${roomCode} and ID: ${roomId}`);

  const reponseContent: CreateResponse = { roomCode, roomId };
  response.send(reponseContent);
});

interface CreateRequest {
  username: string;
  language: string;
}

interface CreateResponse {
  roomCode: string;
  roomId: string;
}
