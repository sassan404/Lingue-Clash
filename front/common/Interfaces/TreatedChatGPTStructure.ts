// types for rpelies from ChatGPt
export interface TreatedAIReplyStructure {}

export interface SentenceEvaluationReply extends TreatedAIReplyStructure {
  sentence: string;
  score: number;
  language: string;
  missingWords: string[];
  spellingMistakes: string[];
  grammarMistakes: string[];
  coherenceMistakes: string[];
}
export type SentenceEvaluationReplyKeys = keyof SentenceEvaluationReply;

export class SentenceEvaluationReply {
  /// constructor
  constructor(SentenceEvaluationReply: SentenceEvaluationReply) {
    this.sentence = SentenceEvaluationReply.sentence;
    this.score = 0;
    this.language = SentenceEvaluationReply.language;
    this.missingWords = SentenceEvaluationReply.missingWords ?? [];
    this.spellingMistakes = SentenceEvaluationReply.spellingMistakes ?? [];
    this.grammarMistakes = SentenceEvaluationReply.grammarMistakes ?? [];
    this.coherenceMistakes = SentenceEvaluationReply.coherenceMistakes ?? [];
  }
}
export interface SentenceReply extends TreatedAIReplyStructure {
  language: string;
  words: string[];
  sentence: string;
}

export class SentenceReply {
  // constructor
  constructor(sentenceReply: SentenceReply) {
    this.language = sentenceReply.language;
    this.words = sentenceReply.words;
    this.sentence = sentenceReply.sentence;
  }
}
