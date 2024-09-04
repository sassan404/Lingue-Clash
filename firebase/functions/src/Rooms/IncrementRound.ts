import {
  HttpsError,
  HttpsFunction,
  onRequest,
} from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { giveMeWords } from "../ChatGPT/giveMeWords";
import {
  GivenWords,
  InitiateNewRoundRequest,
  Languages,
  PlayerStates,
  RoomStates,
} from "../Interfaces/interfaces";

// Function to initiate the start of a new round
export const initiateNewRound: HttpsFunction = onRequest(
  async (request, response) => {
    const { roomId } = request.body as InitiateNewRoundRequest;

    const roomRef = database.ref(`rooms/${roomId}`);
    const roomSnapshot = await roomRef.once("value");
    const roomData = roomSnapshot.val();

    if (!roomData) {
      throw new HttpsError("not-found", "Room not found");
    }

    roomRef.update({
      state: RoomStates.LOADING,
    });
 
    const newRoundNumber = roomData.currentRound + 1;

    // Update the currentRound in the room to trigger startNewRound function
    await roomRef.update({
      currentRound: newRoundNumber,
    });

    const roundRef = database.ref(`rooms/${roomId}/rounds/${newRoundNumber}`);

    const languages: Languages = {
      wordNumber: newRoundNumber,
      languages: roomData.languages,
    };
    let words: GivenWords = await giveMeWords(languages);

    await roundRef.set({
      wordList: words,
    });

    const players = roomData.players;
    players.forEach((username: string) => {
      const playerRef = database.ref(
        `rooms/${roomId}/players/${username}`,
      );
      playerRef.update({
        state: PlayerStates.WAITING,
      });
    })

    roomRef.update({
      state: RoomStates.WAITING,
    });
    
    console.log(`Initiated new round ${newRoundNumber} in room ${roomId}`);
    response.send({ roomId, newRoundNumber });
  },
);
