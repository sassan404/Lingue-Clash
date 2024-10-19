// Define the interface structure as a constant object
export interface SentenceOrder {
  language: string;
  words: string[];
  sentence: string;
  order: number;
}

export interface Explanation {
  rule: string;
  explanation: string;
}
