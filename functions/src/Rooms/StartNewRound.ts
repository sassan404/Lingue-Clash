import { Reference } from "firebase-admin/database";
import { RoundContainer } from "../../../front/common/Interfaces/Round/Round";
import { Languages } from "../../../front/common/Interfaces/TreatedRequest";
import { giveMeWords } from "../ChatGPT/GiveMeWords";
import {
  PlayerStates,
  RoundStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import { Player } from "../../../front/common/Interfaces/Player";
import { RoundHelpers } from "../../../front/common/Interfaces/Round/RoundHelpers";

export const listenToPlayersStateChange = async (roomRef: Reference) => {
  const roundRef = roomRef.child("currentRound");
  const currentRoundState: RoundStates = (
    await roundRef.child("state").once("value")
  ).val();

  const players: { [playerId: string]: Player } = (
    await roomRef.child("players").once("value")
  ).val();

  if (
    !(
      currentRoundState &&
      players &&
      (await checkIfAllPlayersHaveResults(roundRef, players))
    )
  )
    return;

  const playersList: Player[] = Object.values(players);
  const allPlayersReady = playersList.every(
    (player: Player) => player.state === PlayerStates.READY,
  );

  if (allPlayersReady) {
    if (
      currentRoundState === RoundStates.PLAYING ||
      currentRoundState === RoundStates.STARTING ||
      currentRoundState === RoundStates.ENDED
    ) {
      return;
    }

    await roundRef.transaction((round) => {
      if (round) {
        round.state = RoundStates.ENDED;
      }
      return round;
    });
    await startNewRound(roomRef);
    for (let playerId of Object.keys(players)) {
      await roomRef.child(`players/${playerId}`).update({
        state: PlayerStates.PLAYING,
      });
    }
  } else {
    if (currentRoundState === RoundStates.FINISHED) {
      return;
    }
    const allPlayersFinished = playersList.every(
      (player: { state: PlayerStates }) =>
        player.state === PlayerStates.FINISHED,
    );

    if (allPlayersFinished) {
      await roundRef.transaction((round) => {
        if (round) {
          round.state = RoundStates.FINISHED;
        }
        return round;
      });
      await finishRound(roomRef);
    }
  }
};

const finishRound = async (roomRef: Reference) => {
  const currentRoundNumber = (
    await roomRef.child("currentRoundNumber").once("value")
  ).val();
  if (currentRoundNumber >= RoundHelpers.maxRounds) {
    startNewRound(roomRef);
  } else {
    const players = Object.keys(
      (await roomRef.child("players").once("value")).val(),
    );
    players.forEach(async (player: string) => {
      await roomRef.child(`players/${player}`).update({
        state: PlayerStates.WAITING,
      });
    });
  }
};

export const startNewRound = async (roomRef: Reference) => {
  let newRoundNumber!: number;

  const transtactionResult = await roomRef
    .child("currentRoundNumber")
    .transaction((roundNumber: number) => {
      if (roundNumber != null) {
        newRoundNumber = roundNumber + 1;
        roundNumber = newRoundNumber;
      }
      return roundNumber;
    });

  if (transtactionResult.committed && newRoundNumber >= 0) {
    const lastRound: RoundContainer = (
      await roomRef.child("currentRound").once("value")
    ).val();
    roomRef
      .child("progress")
      .set((newRoundNumber / RoundHelpers.maxRounds) * 100);
    if (newRoundNumber <= RoundHelpers.maxRounds) {
      roomRef.update({ isLocked: true });

      const languages: Languages = {
        wordNumber: newRoundNumber + 1,
        languages: (await roomRef.child("languages").once("value")).val(),
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

      roomRef.child("currentRound").on("child_changed", async (snapshot) => {
        if (snapshot) {
          listenToPlayersStateChange(roomRef);
        }
      });

      await giveMeWords(languages).then(async (words) => {
        await roomRef.child("currentRound").update({
          givenWords: words.words,
        });
      });

      await roomRef.child("currentRound").update({
        state: RoundStates.PLAYING,
      });
    } else {
      const players: { [playerId: string]: Player } = (
        await roomRef.child("players").once("value")
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
    await roomRef.child("rounds").update({
      [newRoundNumber - 1]: lastRound,
    });
    roomRef.update({ isLocked: false });
  }
};

const checkIfAllPlayersHaveResults = async (
  roundRef: Reference,
  players: { [playerId: string]: Player },
) => {
  const playerIds = Object.keys(players);

  let allPlayersHaveResults = false;
  await roundRef.once("value", async (snapshot) => {
    const roundValue = snapshot.val();
    if (roundValue) {
      if (roundValue.result) {
        const playersWithResults = Object.keys(roundValue.result);
        allPlayersHaveResults = playerIds.every((playerId) => {
          return playersWithResults.includes(playerId);
        });
      } else if (roundValue.type === RoundTypes.LOBBY) {
        allPlayersHaveResults = true;
      }
    }
  });

  return allPlayersHaveResults;
};
