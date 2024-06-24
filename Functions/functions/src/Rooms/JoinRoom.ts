import {onRequest} from "firebase-functions/v2/https";
import {database} from "../realtime-db.config";


// Example usage
// joinRoom("ABC123", "user2", "Spanish").then(() => {
//   console.log("User joined the room");
// });

export const joinRoom = onRequest(async (request, response) => {
  const {roomCode, username, language} = request.body as JoinRequest;

  const roomsRef = database.ref("rooms");
  const roomSnapshot = await roomsRef.orderByChild("roomCode").equalTo(roomCode).once("value");

  if (!roomSnapshot.exists()) {
    console.log("Invalid room code");
    return;
  }

  const roomId = Object.keys(roomSnapshot.val())[0];
  const roomRef = database.ref(`rooms/${roomId}/players/${username}`);


  await roomRef.set({
    username,
    language,
    score: 0,
    joinedAt: Date.now(),
  });


  console.log(`Room created with code: ${roomCode}`);


  const reponseContent: JoinResponse = {roomCode};
  response.send(reponseContent);
});


  interface JoinRequest {
    username: string;
    language: string;
    roomCode: string;
}

interface JoinResponse {
    roomCode: string;
}
