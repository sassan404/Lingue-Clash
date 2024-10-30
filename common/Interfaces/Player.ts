import { PlayerStates, RoundStates } from "./enums";

export interface Player {
  joinedAt: number;
  language: string;
  score: number;
  username: string;
  state: PlayerStates;
}

export class Player {
  constructor(player: Player) {
    this.joinedAt = player.joinedAt;
    this.language = player.language;
    this.score = player.score;
    this.username = player.username;
    this.state = player.state;
  }

  isPlayerReady = () => {
    return (
      this.state === PlayerStates.READY || this.state === PlayerStates.FINISHED
    );
  };

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

  isWaiting = (roundState: RoundStates) => {
    return roundState === RoundStates.PLAYING && this.state === PlayerStates.FINISHED;
  };
}
