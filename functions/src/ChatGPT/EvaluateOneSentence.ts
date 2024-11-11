import { CommunicateWithChatGP } from "./CommunicateWithChatGPT";

import { Sentence } from "../../../front/common/Interfaces/Sentence";
import { SentenceEvaluationReply } from "../../../front/common/Interfaces/TreatedChatGPTStructure";
import { HttpsFunction, onRequest } from "firebase-functions/v2/https";
import { Request, Response } from "firebase-functions/v1";
// Define the interface structure as a constant object

const explanation = {
  rule: "string",
  explanation: "string",
} as const;

const sentenceEvaluationReply = {
  score: "number",
  explanation: [explanation],
} as const;

/**
 * Container class for the 'giveMeTwoWords' function.
 */
class EvaluateOneSentenceContainer extends CommunicateWithChatGP<
  Sentence,
  SentenceEvaluationReply
> {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {Languages} sentences the languages to be used.
   * @return {String} The message.
   */
  override message(sentence: Sentence): string {
    return `Consider yourself a language teacher teaching ${sentence.language} and I am your student.
    You have given me a task to write a sentence using the following words: ${sentence.words.join(", ")}.
    I have written this sentence and the next step is for you to evaluate it.
    Starting from 0, with each mistake subtract 1, and with each rule respected add 1, the final value will be the score.
    Here is the sentence: ${sentence.sentence}
    The rules to check:
     1 - Each sentence should include all the corresposing words with their exact form
     2 - The sentence should be in the correct language
     3 - The spelling of the words should be correct
     4 - The sentence should be grammatically correct
     5 - The sentence should be coherent and convey a proper meaning
     In the response you should provide:
     1 - The score for the sentence
     2 - A detailed explanation of the evaluation process for each rule.
  The response should only be a json array following the format of this interface:
  ${JSON.stringify(sentenceEvaluationReply, null, 2)}`;
  }
}

/**
 * Handler for the giveMeTwoWords request.
 */
export const evaluateOneSentenceRequest: HttpsFunction = onRequest(
  async (request: Request, response: Response) => {
    const newCommunicateWithChatGP = new EvaluateOneSentenceContainer();

    await newCommunicateWithChatGP.communicateOnRequest(request, response);
  },
);

export const evaluateOneSentence = async (
  request: Sentence,
): Promise<SentenceEvaluationReply> => {
  const newCommunicateWithChatGP = new EvaluateOneSentenceContainer();

  return await newCommunicateWithChatGP.communicate(request);
};
