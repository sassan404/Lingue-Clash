import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { PlayerAnswer } from "../../../front/common/Interfaces/Responses";
import {
  PlayerStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import {
  RoundHelper,
  SentenceBuildingRoundHelper,
} from "./SentenceBuildingRoundHelper";

export const submitPlayerAnswer = onRequest(
  { cors: true },
  async (request, response) => {
    const { roomId, username, answer } = request.body as PlayerAnswer;

    const roomRef = database.ref(`rooms/${roomId}`);
    const roomSnapshot = await roomRef.once("value");

    if (!roomSnapshot.exists()) {
      console.log("Invalid room code");
      return;
    }

    const currentRoundType = (
      await roomRef.child("currentRound/type").once("value")
    ).val();

    let currentRoundHelper!: RoundHelper<any>;

    if (currentRoundType === RoundTypes.SENTENCE_BUILDING) {
      currentRoundHelper = new SentenceBuildingRoundHelper(
        roomRef,
        username,
        answer,
      );
    }

    if (currentRoundHelper) {
      const playerRef = roomRef.child(`players/${username}`);

      await playerRef.update({
        state: PlayerStates.FINISHED,
      });

      await currentRoundHelper.setPlayerAnswerForRound();

      const responseContent = {
        success: `Player: "${username}" asnwer was submitted in room: "${roomId}"`,
      };

      response.send(responseContent);
    }
  },
);
