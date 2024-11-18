import { Reference } from "firebase-admin/database";
import {
  PlayerStates,
  RoundStates,
} from "../../../../front/common/Interfaces/enums";
import { Player } from "../../../../front/common/Interfaces/Player";
import { HttpsError } from "firebase-functions/v2/https";

export async function updateStateForAllPlayers(
  roomRef: Reference,
  state: PlayerStates,
  players: { [playerId: string]: Player },
) {
  for (let playerId of Object.keys(players)) {
    roomRef.child(`players/${playerId}/state`).set(state);
  }
}

export function areAllPlayersWithState(
  state: PlayerStates,
  players: { [playerId: string]: Player },
) {
  const playersList: Player[] = Object.values(players);
  return playersList.every((player: Player) => player.state === state);
}

export async function setRoundCanStartIfAllPlayersReady(roomRef: Reference) {
  const playersSnapshot = await roomRef.child("players").once("value");

  const playersList: Player[] = Object.values(playersSnapshot.val());

  const currentRoundState = (
    await roomRef.child("currentRound/state").once("value")
  ).val();

  if (currentRoundState === RoundStates.ENDED)
    throw new HttpsError("already-exists", "Round is already ended");
  if (currentRoundState !== RoundStates.FINISHED)
    throw new HttpsError("invalid-argument", "Round is not finished");

  const allPlayersReady = playersList.every(
    (player: Player) => player.state === PlayerStates.READY,
  );

  if (allPlayersReady) {
    roomRef.child("currentRound/state").set(RoundStates.ENDED);
    roomRef.child("roundCanStart").set(true);
  }
}
