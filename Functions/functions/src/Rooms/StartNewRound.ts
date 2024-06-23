
import {database as fireDatabase} from "firebase-functions";
import {database} from "../realtime-db.config";


// Function to create a new round
export const startNewRound = fireDatabase.ref("/rooms/{roomId}/currentRound").onUpdate(async (change, context) => {
  const roomId = context.params.roomId;
  const currentRound = change.after.val();

  const newRoundNumber = currentRound + 1;
  const newRoundRef = database.ref(`rooms/${roomId}/rounds`).push();
  const newRoundId = newRoundRef.key;

  // Start the new round
  await newRoundRef.set({
    roundNumber: newRoundNumber,
    startTime: Date.now(),
    endTime: null, // To be set when the round ends
    winner: null, // To be set when the round ends
    results: {},
  });

  // Update the currentRound in the room
  await database.ref(`rooms/${roomId}`).update({
    currentRound: newRoundNumber,
  });

  console.log(`Round ${newRoundNumber} started in room ${roomId}`);
  return {roundId: newRoundId, roundNumber: newRoundNumber};
});
