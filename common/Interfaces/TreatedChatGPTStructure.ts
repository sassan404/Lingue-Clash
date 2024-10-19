import { Explanation } from "./Interfaces";

// types for rpelies from ChatGPt
export interface TreatedChatGPTStructure {}

export interface SentenceEvaluationReply extends TreatedChatGPTStructure {
  score: number;
  explanation: Explanation[];
}

export interface SentenceReply extends TreatedChatGPTStructure {
  language: string;
  words: string[];
  sentence: string;
}
