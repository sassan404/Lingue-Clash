import { TreatedAIReplyStructure } from './TreatedChatGPTStructure';

export interface GivenWord {
  [language: string]: string;
}

export interface GivenWords extends TreatedAIReplyStructure {
  words: GivenWord[];
}
