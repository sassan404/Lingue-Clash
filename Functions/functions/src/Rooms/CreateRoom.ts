import {onRequest} from "firebase-functions/v2/https";
import {database} from "../realtime-db.config";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};


// // Example usage
// createRoom("user1", "French").then(({roomId, roomCode}) => {
//   console.log(`Room ID: ${roomId}, Room Code: ${roomCode}`);
// });


export const createRoom = onRequest(async (request, response) => {
  const {username, language} = request.body as CreateRequest;
  const roomCode = generateRoomCode();

  const roomRef = database.ref("rooms").push();


  const currentTime = Date.now();

  await roomRef.set({
    roomName: `Room created by ${username}`,
    createdAt: currentTime,
    createdBy: username,
    currentRound: 0,
    roomCode,
    players: {
      [username]: {
        username,
        language,
        score: 0,
        joinedAt: currentTime,
      },
    },
    rounds: {},
  });
  console.log(`Room created with code: ${roomCode}`);


  const reponseContent: CreateResponse = {roomCode};
  response.send(reponseContent);
});


interface CreateRequest {
    username: string;
    language: string;
}

interface CreateResponse {
    roomCode: string;
}
