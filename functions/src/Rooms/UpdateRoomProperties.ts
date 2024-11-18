import { HttpsError, onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { RoomPropertiesUpdateRequest } from "../../../front/common/Interfaces/Requests";
import { JoinRoomResponse } from "../../../front/common/Interfaces/Responses";
import {
  RoundStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import { WordsToTranslate } from "../../../front/common/Interfaces/TreatedRequest";
import { translateWords } from "../ChatGPT/TranslateWords";
import { warn } from "firebase-functions/logger";
import { Reference } from "firebase-admin/database";
import { setRoundCanStartIfAllPlayersReady } from "./Helpers/PlayerStateHelper";

export const updateRoomProperties = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      const { numberOfRounds, numberofWords, wordsList, roomId } =
        request.body as RoomPropertiesUpdateRequest;

      const roomRef = database.ref(`rooms/${roomId}`);

      await checkThatRoomIsInLobby(roomRef);

      await setRoomProperties(
        roomRef,
        numberOfRounds,
        numberofWords,
        wordsList,
      );

      setRoundCanStartIfAllPlayersReady(roomRef);

      const reponseContent: JoinRoomResponse = { roomId };
      response.send(reponseContent);
    } catch (error) {
      warn((error as Error).message);
      response.status(500).send(error);
    }
  },
);

async function checkThatRoomIsInLobby(roomRef: Reference) {
  const roomSnapshot = await roomRef.once("value");

  if (!roomSnapshot.exists()) {
    throw new HttpsError("not-found", "Room does not exist");
  }

  const currentRoundType = (
    await roomRef.child("currentRound/type").once("value")
  ).val();

  if (currentRoundType !== RoundTypes.LOBBY) {
    throw new HttpsError(
      "permission-denied",
      "Room is not in lobby phase, player can't join",
    );
  }
}

async function setRoomProperties(
  roomRef: Reference,
  numberOfRounds: number,
  numberofWords: number,
  wordsList: string[],
) {
  await roomRef.update({
    isLocked: true,
  });

  const wordsToTranslate: WordsToTranslate = {
    words: wordsList,
    languages: (await roomRef.child("languages").once("value")).val(),
  };

  // Call the ChatGPT function
  const givenWordsWithTranslation = await translateWords(wordsToTranslate);

  await roomRef.update({
    numberOfRounds: numberOfRounds,
    numberofWords: numberofWords,
    wordsList: givenWordsWithTranslation.words,
  });
  await roomRef.child("currentRound").update({
    state: RoundStates.FINISHED,
  });

  await roomRef.update({
    isLocked: false,
  });
}
