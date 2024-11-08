export interface Explanation {
  rule: string;
  explanation: string;
}

// types for rpelies from ChatGPt
export interface TreatedAIReplyStructure {}

export interface SentenceEvaluationReply extends TreatedAIReplyStructure {
  score: number;
  explanation: Explanation[];
}

export interface SentenceReply extends TreatedAIReplyStructure {
  language: string;
  words: string[];
  sentence: string;
}
