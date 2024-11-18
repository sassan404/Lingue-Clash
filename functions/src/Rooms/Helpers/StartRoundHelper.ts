import { Reference } from "firebase-admin/database";
import {
  PlayerStates,
  RoundStates,
  RoundTypes,
} from "../../../../front/common/Interfaces/enums";
import { Player } from "../../../../front/common/Interfaces/Player";
import { GivenWord } from "../../../../front/common/Interfaces/GivenWord";
import { updateStateForAllPlayers } from "./PlayerStateHelper";

export class StartRoundHelper {
  //references
  roundRef = this.roomRef.child("currentRound");
  lockedRef = this.roomRef.child("isLocked");
  wordListRef = this.roomRef.child("wordsList");
  roundRefByRoundNumber = (roundNumber: number) =>
    this.roomRef.child(`rounds/${roundNumber}`);

  // variables to be initiated
  players!: { [playerId: string]: Player };
  currentRoundNumber!: number;
  wordsUsedLastRound!: GivenWord[];
  numberOfRoundsInGame!: number;

  constructor(public roomRef: Reference) {}

  async initialiseValues() {
    this.players = (await this.roomRef.child("players").once("value")).val();
    this.currentRoundNumber = (
      await this.roomRef.child("currentRoundNumber").once("value")
    ).val();
    this.wordsUsedLastRound =
      (
        await this.roomRef.child("currentRound/givenWords").once("value")
      ).val() ?? [];
    this.numberOfRoundsInGame = (
      await this.roomRef.child("numberOfRounds").once("value")
    ).val();
  }

  startNewRound = async () => {
    await this.initialiseValues();
    let newRoundNumber: number = this.currentRoundNumber + 1;
    this.lockedRef.transaction((locked) => {
      if (locked === null) return locked;
      if (locked === false) return true;
      return;
    });
    this.roomRef.child("roundCanStart").transaction((canStart) => {
      if (canStart === null) return canStart;
      if (canStart === true) return false;
      return;
    });
    const transtactionResult = await this.roomRef
      .child("currentRoundNumber")
      .transaction((roundNumber: number) => {
        if (roundNumber === null) return roundNumber;
        if (roundNumber >= 0 && roundNumber !== newRoundNumber) {
          return newRoundNumber;
        }
        return;
      });

    if (transtactionResult.committed && newRoundNumber >= 0) {
      this.updateGameProgress(newRoundNumber);

      await this.buildPlayingRound(newRoundNumber);
    }
    this.lockedRef.transaction((locked) => {
      if (locked === null) return locked;
      if (locked === true) return false;
      return;
    });
  };

  buildPlayingRound = async (newRoundNumber: number) => {
    await this.wordListRef.once("value").then(async (snapshot) => {
      const wordsForRound = this.formWordListForRound(
        snapshot.val(),
        newRoundNumber + 1,
      );
      const round = {
        startAt: Date.now(),
        startAtTimestamp: new Date().toISOString(),
        state: RoundStates.PLAYING,
        type: RoundTypes.SENTENCE_BUILDING,
        givenWords: wordsForRound,
        playerWords: [],
        result: {},
      };

      await this.roundRef.set(round);

      this.roundRefByRoundNumber(newRoundNumber).set(round);

      updateStateForAllPlayers(
        this.roomRef,
        PlayerStates.PLAYING,
        this.players,
      );
    });
  };

  formWordListForRound = (
    wordsForGame: GivenWord[],
    numberOfWordsForRound: number,
  ) => {
    const wordsNotUsedLastRound: GivenWord[] = wordsForGame
      .filter(
        (word: GivenWord) =>
          this.wordsUsedLastRound.findIndex(
            (wordUsed) => wordUsed["English"] === word["English"],
          ) < 0,
      )
      .sort(() => 0.5 - Math.random());

    while (
      wordsNotUsedLastRound.length < numberOfWordsForRound &&
      this.wordsUsedLastRound.length > 0
    ) {
      wordsNotUsedLastRound.push(
        this.wordsUsedLastRound
          .sort(() => 0.5 - Math.random())
          .pop() as GivenWord,
      );
    }
    while (wordsNotUsedLastRound.length > numberOfWordsForRound)
      wordsNotUsedLastRound.pop();

    return wordsNotUsedLastRound;
  };

  updateGameProgress = async (newRoundNumber: number) => {
    const newProgress = (newRoundNumber / this.numberOfRoundsInGame) * 100;
    this.roomRef.child("progress").transaction((progress) => {
      if (progress === null) return progress;
      if (progress !== newProgress)
        return (newRoundNumber / this.numberOfRoundsInGame) * 100;
      return;
    });
  };
}
