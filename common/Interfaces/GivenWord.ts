import { TreatedChatGPTStructure } from "./TreatedChatGPTStructure";

export interface GivenWord {
  [language: string]: string;
}

export interface GivenWords extends TreatedChatGPTStructure {
  words: GivenWord[];
}
