import { RoundTypes } from "../enums";
import { RoundContainer } from "./Round";
import { SentenceBuildingRound } from "./SentenceBuildingRound";
import { TestRound } from "./TestRound";

export let RoundHelpers = {
  maxRounds: 10,
  isSentenceBuildingRound: (
    round: RoundContainer
  ): round is SentenceBuildingRound => {
    return round.type == RoundTypes.SENTENCE_BUILDING;
  },
  getSentenceBuildingRound: (
    round: RoundContainer
  ): SentenceBuildingRound | undefined => {
    if (RoundHelpers.isSentenceBuildingRound(round)) {
      return new SentenceBuildingRound(round);
    }
    return;
  },
  isTestRound: (round: RoundContainer): round is TestRound => {
    return round.type === RoundTypes.TEST;
  },
  getTestRound: (round: RoundContainer): TestRound | undefined => {
    if (RoundHelpers.isTestRound(round)) {
      return new TestRound(round);
    }
    return;
  },
};
