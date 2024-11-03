import { Reference } from "firebase-admin/database";
import { RoundContainer } from "../../../../common/Interfaces/Round/Round";
import { Languages } from "../../../../common/Interfaces/TreatedRequest";
import { giveMeWords } from "../ChatGPT/giveMeWords";
import { RoundStates, RoundTypes } from "../../../../common/Interfaces/enums";
import { RoomContainer } from "../../../../common/Interfaces/Room";
import { Player } from "../../../../common/Interfaces/Player";
import { RoundHelpers } from "../../../../common/Interfaces/Round/RoundHelpers";

export const startNewRound = async (roomRef: Reference) => {
  let newRoundNumber!: number;
  let lastRound!: RoundContainer;

  const transtactionResult = await roomRef.transaction(
    (room: RoomContainer) => {
      if (room) {
        room.currentRoundNumber++;

        newRoundNumber = room.currentRoundNumber;
        room.progress =
          (room.currentRoundNumber / RoundHelpers.maxRounds) * 100;

        lastRound = room.currentRound;
      }
      return room;
    },
  );

  if (transtactionResult.committed && newRoundNumber && lastRound) {
    if (newRoundNumber <= RoundHelpers.maxRounds) {
      await roomRef.child("countDown").transaction((countDown) => {
        countDown = 5;
        return countDown;
      });

      const languages: Languages = {
        wordNumber: newRoundNumber,
        languages: (await roomRef.child("languages").get()).val(),
      };

      let newRound = {
        startAt: Date.now(),
        startAtTimestamp: new Date().toISOString(),
        state: RoundStates.STARTING,
        type: RoundTypes.SENTENCE_BUILDING,
        givenWords: [],
        playerWords: [],
        result: {},
      };

      await roomRef.update({
        currentRound: newRound,
      });

      giveMeWords(languages).then(async (words) => {
        await roomRef.child("currentRound").update({
          givenWords: words.words,
        });
      });

      let count = 0;
      const intervalId = await setInterval(async () => {
        await roomRef.child("countDown").transaction((countDown) => {
          if (countDown >= 0) {
            countDown = count;
          }
          return countDown;
        });
        if (count === 0) {
          clearInterval(intervalId);
        }
        count--;
      }, 250);
      await roomRef.child("currentRound").update({
        state: RoundStates.PLAYING,
      });
    } else {
      const players: { [playerId: string]: Player } = (
        await roomRef.child("players").get()
      ).val();

      // Create a map of player IDs to player scores
      const playerScores = Object.keys(players).reduce(
        (acc, playerId) => {
          acc[playerId] = players[playerId].score;
          return acc;
        },
        {} as { [playerId: string]: number },
      );

      let newRound = {
        startAt: Date.now(),
        startAtTimestamp: new Date().toISOString(),
        state: RoundStates.FINISHED,
        type: RoundTypes.END,
        result: playerScores,
      };

      await roomRef.update({
        currentRound: newRound,
      });
    }
    roomRef.child("rounds").update({
      [newRoundNumber - 1]: lastRound,
    });
  }
};
