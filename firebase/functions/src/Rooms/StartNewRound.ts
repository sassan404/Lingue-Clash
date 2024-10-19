import { Reference } from "firebase-admin/database";
import { RoundContainer } from "../../../../common/Interfaces/Round/Round";
import { Languages } from "../../../../common/Interfaces/TreatedRequest";
import { giveMeWords } from "../ChatGPT/giveMeWords";
import { SentenceBuildingRound } from "../../../../common/Interfaces/Round/SentenceBuildingRound";
import { RoundStates, RoundTypes } from "../../../../common/Interfaces/enums";

export const startNewRound = async (roomRef: Reference) => {
  let newRoundNumber!: number;
  let lastRound!: RoundContainer;

  const transtactionResult = await roomRef.transaction((room) => {
    if (room) {
      room.currentRoundNumber++;

      newRoundNumber = room.currentRoundNumber;

      lastRound = room.currentRound;
    }
    return room;
  });

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

    console.log("Starting new round with words: ", languages);

    let newRound: SentenceBuildingRound = {
      startAt: Date.now(),
      startAtTimestamp: new Date().toISOString(),
      countDown: 5,
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
      console.log("Words received: ", words);
      await roomRef.child("currentRound").update({
        givenWords: words.words,
      });
    });

    await roomRef.child("rounds").update({
      [newRoundNumber - 1]: lastRound,
    });

    let count = 5;
    const intervalId = await setInterval(async () => {
      count--;
      await roomRef.child("currentRound").transaction((round) => {
        if (round) {
          round.countDown = count;
          if (count == 0) {
            round.state = RoundStates.PLAYING;
            clearInterval(intervalId);
          }
        }
        return round;
      });
    }, 1000);
  }
};
