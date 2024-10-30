import { RoundStates, RoundTypes } from "../enums";

export interface RoundContainer {
  
  startAt: number;
  startAtTimestamp: string;
  state: RoundStates;
  type: RoundTypes;
  result: { [playerId: string]: any };
}

export class RoundContainer {
  constructor(round: RoundContainer) {
    this.startAt = round.startAt;
    this.startAtTimestamp = round.startAtTimestamp;
    this.state = round.state;
    this.type = round.type;
  }
}
