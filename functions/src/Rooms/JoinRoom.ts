import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { JoinRoomRequest } from "../../../front/common/Interfaces/Requests";
import { JoinRoomResponse } from "../../../front/common/Interfaces/Responses";
import {
  PlayerStates,
  RoundStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import { Reference } from "firebase-admin/database";
import { warn } from "firebase-functions/logger";

export const joinRoom = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      const { roomCode, username, language } = request.body as JoinRoomRequest;

      const roomId = (
        await database.ref("roomCodes").child(roomCode).once("value")
      ).val();

      if (!roomId) {
        throw new HttpsError("not-found", "Invalid room code");
      }

      // const roomId = Object.keys(roomSnapshot.val())[0];

      const roomRef = database.ref(`rooms/${roomId}`);

      await isRoomInLobbyPhase(roomRef);
      addLanguageToRoom(roomRef, language);
      await addPlayerToRoom(roomRef, username, language);

      const reponseContent: JoinRoomResponse = { roomId };
      response.send(reponseContent);
    } catch (error) {
      warn((error as Error).message);
      response.status(500).send(error);
    }
  },
);

async function isRoomInLobbyPhase(roomRef: Reference) {
  const currentRoundType = (
    await roomRef.child("currentRound/type").once("value")
  ).val();
  const currentRoundState = (
    await roomRef.child("currentRound/state").once("value")
  ).val();

  if (
    currentRoundType !== RoundTypes.LOBBY &&
    currentRoundState !== RoundStates.STARTING
  ) {
    throw new HttpsError(
      "permission-denied",
      "Room is not in a strting lobby phase, player can't join",
    );
  }
}

async function addPlayerToRoom(
  roomRef: Reference,
  username: string,
  language: string,
) {
  const playerRef = roomRef.child(`players/${username}`);

  await playerRef.set({
    username,
    state: PlayerStates.WAITING,
    language,
    score: 0,
    joinedAt: Date.now(),
    joinedAtTimestamp: new Date().toISOString(),
  });
}

async function addLanguageToRoom(roomRef: Reference, language: string) {
  const languagesRef = roomRef.child("languages");
  const languagesSnapshot = await languagesRef.once("value");

  let languagesArray = languagesSnapshot.val();

  const languagesSet = new Set(languagesArray);

  // Add the new language if it's not already present
  languagesSet.add(language);

  // Update the languages array in the room
  await languagesRef.set(Array.from(languagesSet));
}
