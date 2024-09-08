import { CommunicateWithChatGP } from "./CommunicateWithChatGPT";
import {
  SentenceEvaluationReply,
  Sentences,
} from "../../../../common/Interfaces/Interfaces";
// Define the interface structure as a constant object
const sentenceOrder = {
  language: "string",
  words: "string[]",
  sentence: "string",
  order: "number",
} as const;

const explanation = {
  rule: "string",
  explanation: "string",
} as const;

const sentenceEvaluationReply = {
  order: [sentenceOrder],
  explanation: [explanation],
} as const;

/**
 * Container class for the 'giveMeTwoWords' function.
 */
class EvaluateTheSentencesContainer extends CommunicateWithChatGP<
  SentenceEvaluationReply,
  Sentences
> {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {Languages} sentences the languages to be used.
   * @return {String} The message.
   */
  override message(sentences: Sentences): string {
    return `I have several sentences that I need you to evaluate accoprding to the following rules:
    1 - Each sentence should include all the corresposing words with their exact form
    2 - The sentence should be in the correct language
    3 - The spelling of the words should be correct
    4 - The sentence should be grammatically correct
    5 - The sentence should be coherent and convery a proper meaning
    I do not need you to translate or correct the sentences, just evaluate them.
    The evaluation process is to give each sentence a score.
    The score will represent the ranking of the sentence among the other sentences.
    Let us say there are n number of sentences
    - The best sentence will have the order 1
    - The second best sentence will have the order 2
    .......
    - The second worst sentence will have the order n-1
    - The worst sentence will have the order n
    Here are the sentences, their corresposing language and words:
    ${sentences.map((sentence) => JSON.stringify(sentence)).join("\n")}
    In the response you should provide:
    1 - The order of each sentence
    2 - A detailed explanation of the evaluation process with respect to each rule.
  The response should only be a json array following the format of this interface::
  ${JSON.stringify(sentenceEvaluationReply, null, 2)}`;
  }
}

const evaluateTheSentencesContainer = new EvaluateTheSentencesContainer();

export const evaluateTheSentencesRequest =
  evaluateTheSentencesContainer.communicateOnRequest;
