import { Player } from "./Player";
import { RoundContainer } from "./Round/Round";

export interface RoomContainer {
  roomId: string;
  roomName: string;
  roomCode: string;
  createdBy: string;
  createdAt: number,
  createdAtTimestamp: string,
  isLocked: boolean;
  progress: number;
  currentRound: RoundContainer;
  currentRoundNumber: number;
  countDown: number;
  players: {
    [playerId: string]: Player;
  };
  languages: string[]
  rounds: {
    [roundId: string]: RoundContainer; // Define the structure of a round if needed
  };
}

export class RoomContainer {
  constructor(room: RoomContainer) {
    this.roomId = room.roomId;
    this.roomCode = room.roomCode;
    this.createdBy = room.createdBy;
    this.isLocked = room.isLocked;
    this.currentRound = room.currentRound;
    this.roomName = room.roomName;
    this.players = room.players;
    this.rounds = room.rounds;
  }
}
