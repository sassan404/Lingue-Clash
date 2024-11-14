import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { RoomPropertiesUpdateRequest } from "../../../front/common/Interfaces/Requests";
import { JoinRoomResponse } from "../../../front/common/Interfaces/Responses";
import { RoundStates, RoundTypes } from "../../../front/common/Interfaces/enums";
import { WordsToTranslate } from "../../../front/common/Interfaces/TreatedRequest";
import { translateWords } from "../ChatGPT/TranslateWords";

export const updateRoomProperties = onRequest(
  { cors: true },
  async (request, response) => {
    const { numberOfRounds, numberofWords, wordsList, roomId } =
      request.body as RoomPropertiesUpdateRequest;

    const roomRef = database.ref(`rooms/${roomId}`);

    try {
      const currentRoundType = (
        await roomRef.child("currentRound/type").once("value")
      ).val();

      if (currentRoundType !== RoundTypes.LOBBY) {
        console.log("Room is not in lobby");
        response.send({
          error: "Room is not in lobby phase, player can't join",
        });
        return;
      }

      await roomRef.update({
        isLocked: true,
      });

      const languages: string[] = (
        await roomRef.child("languages").once("value")
      ).val();

      const wordsToTranslate: WordsToTranslate = {
        words: wordsList,
        languages: languages,
      };

      // Call the ChatGPT function
      const givenWords = await translateWords(wordsToTranslate);

      await roomRef.update({
        numberOfRounds: numberOfRounds,
        numberofWords: numberofWords,
        wordsList: givenWords.words,
        currentRound: {
          state: RoundStates.FINISHED
        }
      });

      await roomRef.update({
        isLocked: false,
      });

      const reponseContent: JoinRoomResponse = { roomId };
      response.send(reponseContent);
    } catch (error) {
      console.error("Error updating room properties: ", error);
      response.send({ error: error });
    }
  },
);
