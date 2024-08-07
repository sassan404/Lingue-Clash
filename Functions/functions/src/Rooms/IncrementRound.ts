import { onRequest, HttpsError } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";

// Function to initiate the start of a new round
export const initiateNewRound = onRequest(async (request, response) => {
  const { roomId } = request.body as InitiateNewRoundRequest;

  const roomRef = database.ref(`rooms/${roomId}`);
  const roomSnapshot = await roomRef.once("value");
  const roomData = roomSnapshot.val();

  if (!roomData) {
    throw new HttpsError("not-found", "Room not found");
  }

  const newRoundNumber = roomData.currentRound + 1;

  // Update the currentRound in the room to trigger startNewRound function
  await roomRef.update({
    currentRound: newRoundNumber,
  });

  console.log(`Initiated new round ${newRoundNumber} in room ${roomId}`);
  response.send({ roomId, newRoundNumber });
});

//   functions.https.onCall(async (data, context) => {

interface InitiateNewRoundRequest {
  roomCode: string;
  roomId: string;
}
