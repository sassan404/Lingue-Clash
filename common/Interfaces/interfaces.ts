export enum PlayerStates {
  WAITING = "waiting",
  READY = "ready",
  PLAYING = "playing",
  FINISHED = "finished",
}

export enum RoomStates {
  LOADING = "loading",
  WAITING = "waiting",
  READY = "ready",
}

export enum RoundStates {
  STARTING = "starting",
  PLAYING = "playing",
  FINISHED = "finished",
}

export interface Player {
  joinedAt: number;
  language: string;
  score: number;
  username: string;
  state: PlayerStates;
}

export interface RoomContainer {
  roomId: string;
  roomCode: string;
  createdBy: string;
  state: RoomStates;
  roundCanStart: false;
  currentRound: 0;
  roomName: string;
  players: {
    [playerId: string]: Player;
  };
  rounds: {
    [roundId: string]: RoundContainer; // Define the structure of a round if needed
  };
}

export interface RoundContainer {
  countDown: number;
  startAt: number;
  state: RoundStates;
}

export interface SentenceBuildingRound extends RoundContainer {
  givenWords: GivenWords;
  playerWords: string[];
  playerResponses: {
    [playerId: string]: {
      score: number;
      explanation: string;
      answer: string;
    };
  };
}

// types of requests bosy received by the functions (onRequest)
export interface InitiateNewRoundRequest {
  roomId: string;
}

export interface CreateRoomRequest {
  username: string;
  language: string;
}

export interface CreateRoomResponse {
  roomCode: string;
  roomId: string;
}

export interface JoinRoomRequest {
  username: string;
  language: string;
  roomCode: string;
}

export interface JoinRoomResponse {
  roomId: string;
}

export interface LeaveRoomRequest {
  roomId: string;
  username: string;
}

export interface PlayerAnswer {
  roomId: string;
  username: string;
  answer: string;
}

export interface LeaveRoomResponse {
  roomId: string;
  event: string;
}

// types for rpelies from ChatGPt
export interface TreatedChatGPTStructure {}

// Define the interface structure as a constant object
export interface SentenceOrder {
  language: string;
  words: string[];
  sentence: string;
  order: number;
}

export interface Explanation {
  rule: string;
  explanation: string;
}

export interface SentenceEvaluationReply extends TreatedChatGPTStructure {
  score: number;
  explanation: Explanation[];
}

export interface SentenceReply extends TreatedChatGPTStructure {
  language: string;
  words: string[];
  sentence: string;
}

export interface GivenWord {
  wordInEnglish: string;
  translation: {[language: string]: string};
}

export interface GivenWords extends TreatedChatGPTStructure, Array<GivenWord> {}

// types to be used to communicate with ChatGPT
export interface TreatedRequest {}

export interface Sentence {
  language: string;
  words: string[];
  sentence: string;
}

export interface Sentences extends TreatedRequest, Array<Sentence> {}

export interface SentenceRules extends TreatedRequest {
  language: string;
  words: string[];
}

export interface Languages extends TreatedRequest {
  wordNumber: number;
  languages: string[];
}
