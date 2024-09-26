import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import {
  JoinRoomRequest,
  JoinRoomResponse,
  PlayerStates,
  RoomStates,
} from "../../../../common/Interfaces/Interfaces";


export const joinRoom = onRequest(async (request, response) => {
  const { roomCode, username, language } = request.body as JoinRoomRequest;

  const roomSnapshot = await database
    .ref("rooms")
    .orderByChild("roomCode")
    .equalTo(roomCode)
    .once("value");

  if (!roomSnapshot.exists()) {
    console.log("Invalid room code");
    return;
  }

  const roomId = Object.keys(roomSnapshot.val())[0];

  const roomRef = database.ref(`rooms/${roomId}`);

  const isRoomLocked = (await roomRef.child("locked").once("value")).val();
  if (isRoomLocked) {
    console.log("Room is locked");
    response.send({response: "Room is locked"});
    return
  }
  await roomRef.update({
    state: RoomStates.LOADING,
  });

  const playerRef = database.ref(`rooms/${roomId}/players/${username}`);

  await playerRef.set({
    username,
    state: PlayerStates.WAITING,
    language,
    score: 0,
    joinedAt: Date.now(),
    joinedAtTimestamp: new Date().toISOString(),
  });

  const languagesRef = database.ref(`rooms/${roomId}/languages`);
  const languagesSnapshot = await languagesRef.once("value");

  let languagesArray = languagesSnapshot.val();
  // Ensure we have an array
  if (!Array.isArray(languagesArray)) {
    languagesArray = [];
  }

  console.log(`Languages snapshot: ${languagesArray}`);

  const languagesSet = new Set(languagesArray);

  console.log(`Languages set: ${languagesSet}`);

  // Add the new language if it's not already present
  languagesSet.add(language);

  // Update the languages array in the room
  await languagesRef.set(Array.from(languagesSet));

  await roomRef.update({
    state: RoomStates.WAITING,
  });

  console.log(`Room joined with code: ${roomCode}`);

  const reponseContent: JoinRoomResponse = { roomId };
  response.send(reponseContent);
});
