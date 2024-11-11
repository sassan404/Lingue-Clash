import { Reference } from "firebase-admin/database";
import { Sentence } from "../../../front/common/Interfaces/Sentence";
import { SentenceEvaluationReply } from "../../../front/common/Interfaces/TreatedChatGPTStructure";
import { evaluateOneSentence } from "../ChatGPT/EvaluateOneSentence";
import { Player } from "../../../front/common/Interfaces/Player";

export abstract class RoundHelper<T> {
  constructor(
    public roomRef: Reference,
    public playerId: string,
    public answer: string,
  ) {}

  playerRef: Reference = this.roomRef.child(`players/${this.playerId}`);
  roundRef: Reference = this.roomRef.child("currentRound");
  scoresByRoundRef: Reference = this.roomRef.child("scoresByRound");

  abstract buildAnswer: () => Promise<T>;
  abstract setPlayerAnswerForRound: () => void;

  setPlayerScore: (score: number) => void = async (score: number) => {
    const currentRoundNumber = (
      await this.roomRef.child("currentRoundNumber").once("value")
    ).val();

    await this.scoresByRoundRef.child(currentRoundNumber).update({
      [this.playerId]: score,
    });

    await this.playerRef.transaction((player: Player) => {
      if (player) {
        player.score = Number(player.score) + Number(score);
      }
      return player;
    });
  };
}

export class SentenceBuildingRoundHelper extends RoundHelper<Sentence> {
  buildAnswer: () => Promise<Sentence> = async () => {
    const playerLanguage: string = (
      await this.playerRef.child("language").once("value")
    ).val();

    let wordsData = await this.roundRef.child("givenWords").once("value");
    let words = wordsData.val();

    // Ensure words is an array
    if (words && !Array.isArray(words)) {
      words = [words];
    }

    const wordsForPlayerLanguage: string[] = words.map(
      (givenWord: { [language: string]: string }) => {
        return givenWord[playerLanguage];
      },
    );

    const sentence: Sentence = {
      language: playerLanguage,
      words: wordsForPlayerLanguage,
      sentence: this.answer,
    };

    return sentence;
  };

  setPlayerAnswerForRound: () => void = async () => {
    const answer: Sentence = await this.buildAnswer();
    const sentenceEvaluation: SentenceEvaluationReply =
      await evaluateOneSentence(answer);

    const resultRef = this.roundRef.child(`result`);
    await resultRef.update({
      [this.playerId]: sentenceEvaluation,
    });

    this.setPlayerScore(sentenceEvaluation.score);
  };
}
