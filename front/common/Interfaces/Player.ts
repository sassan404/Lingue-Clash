import { GameModes, PlayerStates, RoundStates } from './enums';

export interface Player {
  joinedAt: number;
  joinedAtTimestamp: string;
  language: string;
  score: number;
  username: string;
  state: PlayerStates;
}

export class Player {
  constructor(player: Player) {
    this.joinedAt = player.joinedAt;
    this.joinedAtTimestamp = player.joinedAtTimestamp;
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

  canReady = (
    PlayerCount: number,
    roundState: RoundStates | undefined,
    gameMode: GameModes,
  ) => {
    return (
      (PlayerCount >= 2 || gameMode === GameModes.SOLO) &&
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
    return (
      roundState === RoundStates.PLAYING && this.state === PlayerStates.FINISHED
    );
  };
}
