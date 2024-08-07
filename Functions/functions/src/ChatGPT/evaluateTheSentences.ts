import { CommunicateWithChatGP } from "./CommunicateWithChatGPT";
import { ParamsDictionary } from "express-serve-static-core";
import { log } from "firebase-functions/logger";
import { Request } from "firebase-functions/v1";

// Define the interface structure as a constant object
const SentenceOrder = {
  language: "string",
  words: "string[]",
  sentence: "string",
  order: "number",
} as const;

const explanation = {
  rule: "string",
  explanation: "string",
} as const;

const SentenceEvaluationReply = {
  order: [SentenceOrder],
  explanation: [explanation],
} as const;

/**
 * Container class for the 'giveMeTwoWords' function.
 */
class EvaluateTheSentencesContainer extends CommunicateWithChatGP {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {Languages} languages the languages to be used.
   * @return {String} The message.
   */
  private message = (languages: Sentences[]) =>
    `I have several sentences that I need you to evaluate accoprding to the following rules:
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
    ${languages.map((sentence) => JSON.stringify(sentence)).join("\n")}
    In the response you should provide:
    1 - The order of each sentence
    2 - A detailed explanation of the evaluation process with respect to each rule.
  The response should only be a json array following the format of this interface::
  ${JSON.stringify(SentenceEvaluationReply, null, 2)}`;

  /**
   * Treats the request before sending it to the ChatGPT model.
   * @param {Request<ParamsDictionary>} request The request object.
   * @return {string} The modified request object.
   */
  override treatRequest(request: Request<ParamsDictionary>): string {
    const requestBody: Sentences[] = request.body;
    const messageTosend = this.message(requestBody);
    log.apply("info", ["The message to send is: ", messageTosend]);
    return messageTosend;
  }
}

const evaluateTheSentencesContainer = new EvaluateTheSentencesContainer();

export const evaluateTheSentences = evaluateTheSentencesContainer.communicate;

interface Sentences {
  language: string;
  words: string[];
  sentence: string;
}
