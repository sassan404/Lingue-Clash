import {onRequest, HttpsError} from "firebase-functions/v2/https";
import {database} from "../realtime-db.config";


// Function to handle user leaving a room
export const leaveRoom = onRequest(async (request, response) => {
  const {roomCode, username} = request.body as LeaveRoomRequest;

  const roomsRef = database.ref("rooms");
  const roomSnapshot = await roomsRef.orderByChild("roomCode").equalTo(roomCode).once("value");

  if (!roomSnapshot.exists()) {
    throw new HttpsError("not-found", "Room not found");
  }

  const roomId = Object.keys(roomSnapshot.val())[0];
  const roomRef = database.ref(`rooms/${roomId}`);
  const playerRef = roomRef.child(`players/${username}`);

  // Remove the player from the players list
  await playerRef.remove();

  // Check if there are any players left in the room
  const playersSnapshot = await roomRef.child("players").once("value");
  if (!playersSnapshot.exists() || playersSnapshot.numChildren() === 0) {
    // If no players are left, delete the room
    await roomRef.remove();
    console.log(`Room ${roomId} deleted as no players are left`);
  } else {
    console.log(`User ${username} left room ${roomId}`);
  }

  const reponseContent: LeaveRoomResponse = {roomCode};
  response.send(reponseContent);
});


interface LeaveRoomRequest {
    roomCode: string;
    username: string;
}

interface LeaveRoomResponse {
    roomCode: string;
}
