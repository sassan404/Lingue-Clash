import { RoundTypes } from './enums';
import { Player } from './Player';
import { RoundContainer } from './Round/Round';

export interface RoomContainer {
  roomId: string;
  roomName: string;
  roomCode: string;
  createdBy: string;
  createdAt: number;
  createdAtTimestamp: string;
  gameMode: RoundTypes;
  roundCanStart: boolean;
  isLocked: boolean;
  progress: number;
  currentRound: RoundContainer;
  currentRoundNumber: number;
  players: {
    [playerId: string]: Player;
  };
  languages: string[];
  rounds: {
    [roundId: string]: RoundContainer; // Define the structure of a round if needed
  };

  numberOfRounds: number;
  numberofWords: number;
  wordsList: string[];
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
    this.languages = room.languages;
    this.numberOfRounds = room.numberOfRounds;
    this.numberofWords = room.numberofWords;
    this.wordsList = room.wordsList;
    this.progress = room.progress;
    this.currentRoundNumber = room.currentRoundNumber;
    this.createdAt = room.createdAt;
    this.createdAtTimestamp = room.createdAtTimestamp;
    this.gameMode = room.gameMode;
    this.roundCanStart = room.roundCanStart;
  }
}
