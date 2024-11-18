import { Reference } from "firebase-admin/database";
import {
  PlayerStates,
  GameModes,
  RoundStates,
  RoundTypes,
} from "../../../../front/common/Interfaces/enums";
import { Player } from "../../../../front/common/Interfaces/Player";
import {
  areAllPlayersWithState,
  setRoundCanStartIfAllPlayersReady,
  updateStateForAllPlayers,
} from "./PlayerStateHelper";
import { HttpsError } from "firebase-functions/v2/https";

export class FinishRoundHelper {
  //references
  roundRef = this.roomRef.child("currentRound");
  roundStateRef = this.roundRef.child("state");
  lockedRef = this.roomRef.child("isLocked");
  roundRefByRoundNumber = (roundNumber: number) =>
    this.roomRef.child(`rounds/${roundNumber}`);

  // variables to be initiated
  currentRoundState!: RoundStates;
  players!: { [playerId: string]: Player };
  currentRoundNumber!: number;
  numberOfRoundsInGame!: number;
  gameMode!: GameModes;
  constructor(public roomRef: Reference) {}

  async initialiseValues() {
    this.currentRoundState = (await this.roundStateRef.once("value")).val();
    this.players = (await this.roomRef.child("players").once("value")).val();
    this.currentRoundNumber = (
      await this.roomRef.child("currentRoundNumber").once("value")
    ).val();
    this.numberOfRoundsInGame = (
      await this.roomRef.child("numberOfRounds").once("value")
    ).val();
    this.gameMode = (await this.roomRef.child("gameMode").once("value")).val();
  }

  finishRoundIfAllPlayersFinished = async () => {
    await this.initialiseValues();

    if (this.currentRoundState === RoundStates.FINISHED) {
      throw new HttpsError("invalid-argument", "Round is already finished");
    }

    if (areAllPlayersWithState(PlayerStates.FINISHED, this.players)) {
      await this.roundStateRef.transaction((state) => {
        if (state === null) return state;
        if (state !== RoundStates.FINISHED) {
          return RoundStates.FINISHED;
        }
        return;
      });

      if (this.currentRoundNumber >= this.numberOfRoundsInGame) {
        this.startEndRound();
      } else {
        await updateStateForAllPlayers(
          this.roomRef,
          this.gameMode === GameModes.SOLO
            ? PlayerStates.READY
            : PlayerStates.WAITING,
          this.players,
        );
        setRoundCanStartIfAllPlayersReady(this.roomRef);
      }
    }
  };

  startEndRound = async () => {
    let newRoundNumber: number = this.currentRoundNumber + 1;
    this.lockedRef.transaction((locked) => {
      if (locked === null) return locked;
      if (locked === false) return true;
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
      await this.roundRef.set({
        startAt: Date.now(),
        startAtTimestamp: new Date().toISOString(),
        state: RoundStates.FINISHED,
        type: RoundTypes.END,
      });
    } else {
      throw new HttpsError("internal", "Error starting end round");
    }
    this.lockedRef.transaction((locked) => {
      if (locked === null) return locked;
      if (locked === true) return false;
      return;
    });
  };
}
