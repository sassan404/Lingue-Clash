import { RoundStates, RoundTypes } from "../enums";

export interface RoundContainer {
  countDown: number;
  startAt: number;
  startAtTimestamp: string;
  state: RoundStates;
  type: RoundTypes;
  result: { [playerId: string]: any };
}

export class RoundContainer {
  constructor(round: RoundContainer) {
    this.countDown = round.countDown;
    this.startAt = round.startAt;
    this.state = round.state;
    this.type = round.type;
  }
}
