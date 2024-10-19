import { RoundTypes } from "../enums";
import { GivenWord } from "../GivenWord";
import { RoundContainer } from "./Round";

export interface SentenceBuildingRound extends RoundContainer {
  type: RoundTypes.SENTENCE_BUILDING;
  givenWords: GivenWord[];
  playerWords: string[];
  result: {
    [playerId: string]: {
      score: number;
      explanation: string;
      answer: string;
    };
  };
}

export class SentenceBuildingRound extends RoundContainer {
  constructor(round: SentenceBuildingRound) {
    super(round);
    this.givenWords = round.givenWords;
    this.playerWords = round.playerWords;
    this.result = round.result;
  }
}
