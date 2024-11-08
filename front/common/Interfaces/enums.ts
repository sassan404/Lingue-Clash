export enum PlayerStates {
  WAITING = "waiting",
  READY = "ready",
  PLAYING = "playing",
  FINISHED = "finished",
}

export enum RoundStates {
  STARTING = "starting",
  PLAYING = "playing",
  FINISHED = "finished",
}

export enum RoundTypes {
  SENTENCE_BUILDING = "sentenceBuilding",
  TEST = "test",
  LOBBY = "lobby",
  ROUND = "round",
  END = "end",
}

export enum GamePhases {
  LOBBY = "lobby",
  ROUND = "round",
  END = "end",
}

export enum GameActions {
  JOIN = "join",
  READY = "ready",
  PLAY = "play",
  Finish = "finish",
}
