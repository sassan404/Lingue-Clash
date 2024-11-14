import { Reference } from "firebase-admin/database";
import {
  PlayerStates,
  RoundStates,
  RoundTypes,
} from "../../../../front/common/Interfaces/enums";
import { Player } from "../../../../front/common/Interfaces/Player";
import { RoundHelpers } from "../../../../front/common/Interfaces/Round/RoundHelpers";
import { GivenWord } from "../../../../front/common/Interfaces/GivenWord";

export class StartFinishRoundHelper {
  roundRef = this.roomRef.child("currentRound");
  roundStateRef = this.roundRef.child("state");
  lockedRef = this.roomRef.child("isLocked");
  wordListRef = this.roomRef.child("wordsList");
  roundRefByRoundNumber = (roundNumber: number) =>
    this.roomRef.child(`rounds/${roundNumber}`);

  currentRoundState!: RoundStates;
  players!: { [playerId: string]: Player };
  currentRoundNumber!: number;

  constructor(public roomRef: Reference) {}

  async initialiseValues() {
    this.currentRoundState = (await this.roundStateRef.once("value")).val();
    this.players = (await this.roomRef.child("players").once("value")).val();
    this.currentRoundNumber = (
      await this.roomRef.child("currentRoundNumber").once("value")
    ).val();
  }

  areAllPlayersWithState(state: PlayerStates) {
    const playersList: Player[] = Object.values(this.players);
    return playersList.every((player: Player) => player.state === state);
  }

  async setStateForAllPlayers(state: PlayerStates) {
    for (let playerId of Object.keys(this.players)) {
      await this.roomRef.child(`players/${playerId}`).update({
        state: state,
      });
    }
  }

  listenToPlayersStateChange = async () => {
    await this.initialiseValues();
    // All players have pressed ready so we can start a new round
    if (
      this.currentRoundState == RoundStates.FINISHED &&
      this.areAllPlayersWithState(PlayerStates.READY)
    ) {
      await this.roundStateRef.transaction((state) => {
        if (state) {
          state = RoundStates.ENDED;
        }
        return state;
      });

      await this.startNewRound();
    } else {
      // all players have submitted their answers so we can finish the round
      if (
        this.currentRoundState === RoundStates.PLAYING &&
        this.areAllPlayersWithState(PlayerStates.FINISHED)
      ) {
        await this.finishRound();
      }
    }
  };

  finishRound = async () => {
    await this.roundStateRef.transaction((state) => {
      if (state) {
        state = RoundStates.FINISHED;
      }
      return state;
    });
    if (this.currentRoundNumber >= RoundHelpers.maxRounds) {
      this.startNewRound();
    } else {
      this.setStateForAllPlayers(PlayerStates.WAITING);
    }
  };

  startNewRound = async () => {
    let newRoundNumber: number = this.currentRoundNumber + 1;
    this.lockedRef.transaction(() => {
      return true;
    });
    const transtactionResult = await this.roomRef
      .child("currentRoundNumber")
      .transaction((roundNumber: number) => {
        if (roundNumber >= 0) {
          roundNumber = newRoundNumber;
        }
        return roundNumber;
      });

    if (transtactionResult.committed && newRoundNumber >= 0) {
      this.roomRef
        .child("progress")
        .set((newRoundNumber / RoundHelpers.maxRounds) * 100);

      if (newRoundNumber <= RoundHelpers.maxRounds) {
        await this.wordListRef.once("value").then(async (snapshot) => {
          const words: GivenWord[] = snapshot.val();
          console.log("words", words);
          const round = {
            startAt: Date.now(),
            startAtTimestamp: new Date().toISOString(),
            state: RoundStates.PLAYING,
            type: RoundTypes.SENTENCE_BUILDING,
            givenWords: words
              .sort(() => 0.5 - Math.random())
              .slice(0, newRoundNumber + 1),
            playerWords: [],
            result: {},
          };
          await this.roundRef.set(round);

          this.roundStateRef.on("value", async (snapshot) => {
            if (snapshot) {
              this.listenToPlayersStateChange();
            }
          });

          this.roundRefByRoundNumber(newRoundNumber).set(round);

          this.setStateForAllPlayers(PlayerStates.PLAYING);
        });
      } else {
        await this.roundRef.set({
          startAt: Date.now(),
          startAtTimestamp: new Date().toISOString(),
          state: RoundStates.FINISHED,
          type: RoundTypes.END,
        });
      }
    }
    this.lockedRef.transaction(() => {
      return false;
    });
  };
}
