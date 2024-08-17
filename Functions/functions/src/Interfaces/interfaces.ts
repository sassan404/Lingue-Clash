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
  order: SentenceOrder[];
  explanation: Explanation[];
}

export interface SentenceReply extends TreatedChatGPTStructure {
  language: string;
  words: string[];
  sentence: string;
}

interface Translation {
  language: string;
  word: string;
}

export interface GivenWord {
  wordInEnglish: string;
  translation: Translation[];
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
