import { TreatedRequest } from './TreatedRequest';

export interface Sentence {
  language: string;
  words: string[];
  sentence: string;
}

export interface Sentences extends TreatedRequest {
  sentences: Sentence[];
}
