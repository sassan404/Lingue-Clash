import { CommunicateWithChatGP } from "./CommunicateWithChatGPT";

import { Sentence } from "../../../front/common/Interfaces/Sentence";
import { SentenceEvaluationReply } from "../../../front/common/Interfaces/TreatedChatGPTStructure";
import { HttpsFunction, onRequest } from "firebase-functions/v2/https";
import { Request, Response } from "firebase-functions/v1";
import { GenerateContentResult } from "@google/generative-ai";
import { warn } from "firebase-functions/logger";
// Define the interface structure as a constant object

const sentenceEvaluationReply = {
  language: "string",
  missingWords: "string[]",
  spellingMistakes: "string[]",
  grammarMistakes: "string[]",
  coherenceMistakes: "string[]",
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
    I have written this sentence and the next step is for you to evaluate it, and give me the list of my mistakes
    Here is the sentence: ${sentence.sentence}
    The rules to check:
     1 - Each sentence should include all the corresposing words or one of their corresponsing forms (conjugations for verbs for example), so from those words give me the ones missing from the sentence
     2 - The sentence should be in the correct language so give me which language the sentence is in
     3 - The spelling of the words should be correct, so give me the list of words spelled incorrectly
     4 - The sentence should be grammatically correct, so give me the list of gramatical mistakes
     5 - The sentence should be coherent and convey a proper meaning, so give me the number of incoherent usages of words in the sentence
  The response should only be a json array following the format of this interface:
  ${JSON.stringify(sentenceEvaluationReply, null, 2)}`;
  }

  override treatAIReply(
    chatGPTReply: GenerateContentResult,
  ): SentenceEvaluationReply {
    const treatedChatGPTReply: SentenceEvaluationReply = super.treatAIReply(
      chatGPTReply,
    );
    return new SentenceEvaluationReply(treatedChatGPTReply);
  }

  override checkAnswer(input: Sentence, answer: SentenceEvaluationReply): void {
    if (!answer) {
      warn("input.words", input);
      warn("answer.missingWords", answer);
      throw new Error("The answer is not valid");
    }
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
