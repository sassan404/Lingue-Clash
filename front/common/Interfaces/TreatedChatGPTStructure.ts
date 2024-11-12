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

export interface SentenceReply extends TreatedAIReplyStructure {
  language: string;
  words: string[];
  sentence: string;
}
