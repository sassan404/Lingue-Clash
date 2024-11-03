import { Reference } from "firebase-admin/database";
import { Sentence } from "../../../../common/Interfaces/Sentence";
import { PlayerStates, RoundStates } from "../../../../common/Interfaces/enums";
import { SentenceEvaluationReply } from "../../../../common/Interfaces/TreatedChatGPTStructure";
import { RoundHelpers } from "../../../../common/Interfaces/Round/RoundHelpers";
import { evaluateTheSentence } from "../ChatGPT/evaluateTheSentence";
import { startNewRound } from "./StartNewRound";
import { Player } from "../../../../common/Interfaces/Player";

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
    console.log("currentRoundNumber", currentRoundNumber);

    this.scoresByRoundRef.child(currentRoundNumber).update({
      [this.playerId]: score,
    });

    await this.playerRef.transaction((player: Player) => {
      if (player) {
        player.score = Number(player.score) + Number(score);
      }
      console.log("player", player);
      return player;
    });
  };

  finishRound: () => Promise<void> = async () => {
    this.roundRef.update({
      state: RoundStates.FINISHED,
    });
    const currentRoundNumber = (
      await this.roomRef.child("currentRoundNumber").once("value")
    ).val();
    if (currentRoundNumber >= RoundHelpers.maxRounds) {
      startNewRound(this.roomRef);
    } else {
      const players = Object.keys(
        (await this.roomRef.child("players").once("value")).val(),
      );
      players.forEach(async (player: string) => {
        await this.roomRef.child(`players/${player}`).update({
          state: PlayerStates.WAITING,
        });
      });
    }
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
      await evaluateTheSentence(answer);

    const resultRef = this.roundRef.child(`result`);
    await resultRef.update({
      [this.playerId]: sentenceEvaluation,
    });

    this.setPlayerScore(sentenceEvaluation.score);
  };
}
