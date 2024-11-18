import { RoundTypes } from '../enums';
import { RoundContainer } from './Round';

export interface TestRound extends RoundContainer {
  type: RoundTypes.TEST;
}

export class TestRound {
  constructor(round: TestRound) {
    this.type = round.type;
  }
}
