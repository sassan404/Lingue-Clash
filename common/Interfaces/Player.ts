import { PlayerStates, RoundStates } from "./enums";

export interface Player {
  joinedAt: number;
  language: string;
  score: number;
  username: string;
  state: PlayerStates;
}

export class Player {
  constructor(
    joinedAt: number,
    language: string,
    score: number,
    username: string,
    state: PlayerStates
  ) {
    this.joinedAt = joinedAt;
    this.language = language;
    this.score = score;
    this.username = username;
    this.state = state;
  }

  canReady = (PlayerCount: number, roundState: RoundStates | undefined) => {
    return (
      PlayerCount >= 2 &&
      (!roundState || roundState === RoundStates.FINISHED) &&
      this.state === PlayerStates.WAITING
    );
  };

  canPlay = (roundState: RoundStates) => {
    return (
      roundState === RoundStates.PLAYING && this.state === PlayerStates.PLAYING
    );
  };
}
