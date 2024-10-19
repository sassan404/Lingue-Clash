import { TreatedChatGPTStructure } from "./TreatedChatGPTStructure";

export interface GivenWord {
  word: { [language: string]: string };
}

export interface GivenWords extends TreatedChatGPTStructure {
  words: GivenWord[];
}
