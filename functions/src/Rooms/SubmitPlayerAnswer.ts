import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { PlayerAnswer } from "../../../front/common/Interfaces/Responses";
import {
  PlayerStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import { SentenceBuildingRoundHelper } from "./Helpers/SentenceBuildingRoundHelper";
import { warn } from "firebase-functions/logger";
import { Reference } from "firebase-admin/database";
import { FinishRoundHelper } from "./Helpers/FinishRoundHelper";

export const submitPlayerAnswer = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      const { roomId, username, answer } = request.body as PlayerAnswer;

      const roomRef = database.ref(`rooms/${roomId}`);

      await verifyRoomExists(roomRef);

      await verifyCurrentRoundType(roomRef);

      sendPlayerAnswer(roomRef, username, answer);

      setPlayerStateToFinished(roomRef, username);

      response.send(
        `Player: "${username}" asnwer was submitted in room: "${roomId}"`,
      );
    } catch (error) {
      warn((error as Error).message);
      response.status(500).send(error);
    }
  },
);

async function verifyRoomExists(roomRef: Reference) {
  const roomSnapshot = await roomRef.once("value");

  if (!roomSnapshot.exists()) {
    throw new HttpsError("not-found", "Room does not exist");
  }
}

async function verifyCurrentRoundType(roomRef: Reference) {
  const currentRoundType = (
    await roomRef.child("currentRound/type").once("value")
  ).val();

  if (currentRoundType !== RoundTypes.SENTENCE_BUILDING) {
    throw new HttpsError(
      "invalid-argument",
      "Room is not in sentence building round",
    );
  }
}
async function sendPlayerAnswer(
  roomRef: Reference,
  username: string,
  answer: string,
) {
  let currentRoundHelper: SentenceBuildingRoundHelper =
    new SentenceBuildingRoundHelper(roomRef, username, answer);

  currentRoundHelper.setPlayerAnswerForRound();
}

async function setPlayerStateToFinished(roomRef: Reference, username: string) {
  const playerStateRef = roomRef.child(`players/${username}/state`);

  await playerStateRef.transaction((state) => {
    if (state === null) return state;
    if (state !== PlayerStates.FINISHED) {
      return PlayerStates.FINISHED;
    }
    return;
  });

  new FinishRoundHelper(roomRef).finishRoundIfAllPlayersFinished();
}
