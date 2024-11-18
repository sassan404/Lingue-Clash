import { Reference } from "firebase-admin/database";
import { Sentence } from "../../../../front/common/Interfaces/Sentence";
import { SentenceEvaluationReply } from "../../../../front/common/Interfaces/TreatedChatGPTStructure";
import { evaluateOneSentence } from "../../ChatGPT/EvaluateOneSentence";
import { GivenWord } from "../../../../front/common/Interfaces/GivenWord";

export class SentenceBuildingRoundHelper {
  playerLanguageRef: Reference = this.roomRef.child(
    `players/${this.playerId}/language`,
  );
  currentRoundGivenWordsRef: Reference = this.roomRef.child(
    "currentRound/givenWords",
  );
  resultRef = () =>
    this.roomRef.child(
      `rounds/${this.currentRoundNumber}/result/${this.playerId}`,
    );

  playerLanguage!: string;
  givenWords!: GivenWord[];
  currentRoundNumber!: number;

  constructor(
    public roomRef: Reference,
    public playerId: string,
    public answer: string,
  ) {}

  async initialiseValues() {
    this.playerLanguage = (await this.playerLanguageRef.once("value")).val();
    this.givenWords = (
      await this.currentRoundGivenWordsRef.once("value")
    ).val();
    this.currentRoundNumber = (
      await this.roomRef.child("currentRoundNumber").once("value")
    ).val();
  }

  buildAnswer: () => Sentence = () => {
    const playerLanguage: string = this.playerLanguage;

    let words = this.givenWords;

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
    await this.initialiseValues();
    const answer: Sentence = this.buildAnswer();
    let sentenceEvaluation: SentenceEvaluationReply;
    try {
      sentenceEvaluation = await evaluateOneSentence(answer);

      sentenceEvaluation.sentence = answer.sentence;
      sentenceEvaluation.score =
        20 -
        (sentenceEvaluation.language === answer.language ? 0 : 20) -
        sentenceEvaluation.missingWords.length * 3 -
        sentenceEvaluation.spellingMistakes.length -
        sentenceEvaluation.grammarMistakes.length * 2 -
        sentenceEvaluation.coherenceMistakes.length * 2;

      if (sentenceEvaluation.score < 0) {
        sentenceEvaluation.score = 0;
      } else if (sentenceEvaluation.score > 20) {
        sentenceEvaluation.score = 20;
      }
    } catch (error) {
      sentenceEvaluation = {
        sentence: answer.sentence,
        // continue
        score: 0,
        missingWords: [],
        spellingMistakes: [],
        grammarMistakes: [],
        coherenceMistakes: [],
        language: answer.language,
      };
    }
    const resultRef = this.resultRef();
    resultRef.set(sentenceEvaluation);
  };
}
