import { Reference } from "firebase-admin/database";
import { RoundContainer } from "../../../../common/Interfaces/Round/Round";
import { Languages } from "../../../../common/Interfaces/TreatedRequest";
import { giveMeWords } from "../ChatGPT/giveMeWords";
import { SentenceBuildingRound } from "../../../../common/Interfaces/Round/SentenceBuildingRound";
import { RoundStates, RoundTypes } from "../../../../common/Interfaces/enums";
import { RoomContainer } from "../../../../common/Interfaces/Room";

export const startNewRound = async (roomRef: Reference) => {
  let newRoundNumber!: number;
  let lastRound!: RoundContainer;

  const transtactionResult = await roomRef.transaction(
    (room: RoomContainer) => {
      if (room) {
        room.currentRoundNumber++;

        newRoundNumber = room.currentRoundNumber;

        lastRound = room.currentRound;
      }
      return room;
    },
  );

  if (
    transtactionResult.committed &&
    newRoundNumber &&
    newRoundNumber <= 10 &&
    lastRound
  ) {
    const languages: Languages = {
      wordNumber: newRoundNumber,
      languages: (await roomRef.child("languages").get()).val(),
    };

    let newRound: SentenceBuildingRound = {
      startAt: Date.now(),
      startAtTimestamp: new Date().toISOString(),
      state: RoundStates.STARTING,
      type: RoundTypes.SENTENCE_BUILDING,
      givenWords: [],
      playerWords: [],
      result: {},
    };
    await roomRef.child("countDown").transaction((countDown) => {
      countDown = 5;
      return countDown;
    });

    await roomRef.update({
      currentRound: newRound,
    });

    giveMeWords(languages).then(async (words) => {
      await roomRef.child("currentRound").update({
        givenWords: words.words,
      });
    });

    await roomRef.child("rounds").update({
      [newRoundNumber - 1]: lastRound,
    });

    console.log("start countdown");
    let count = 5;
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
    }, 500);
    await roomRef.child("currentRound").update({
      state: RoundStates.PLAYING,
    });
  }
};
