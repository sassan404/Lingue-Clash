import { HttpsFunction, onRequest } from "firebase-functions/v2/https";
import { GivenWords } from "../../../front/common/Interfaces/GivenWord";
import { WordsToTranslate } from "../../../front/common/Interfaces/TreatedRequest";

import { CommunicateWithChatGP } from "./CommunicateWithChatGPT";
import { Request, Response } from "firebase-functions/v1";
import { GenerateContentResult } from "@google/generative-ai";

// Define the interface structure as a constant object
const wordMeaningStructure = {
  "[lanugage: string]": "string",
} as const;

const wordMeaningArray = {
  words: [wordMeaningStructure],
};
/**
 * Container class for the 'wordsToTranslate' function.
 */
class TranslateWordsContainer extends CommunicateWithChatGP<
  WordsToTranslate,
  GivenWords
> {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {WordsToTranslate} wordsToTranslate the words and languages to be used.
   * @return {String} The message.
   */
  override message(wordsToTranslate: WordsToTranslate): string {
    const languagesWithEnglish =
      wordsToTranslate.languages.indexOf("English") < 0
        ? ["English", ...wordsToTranslate.languages]
        : wordsToTranslate.languages;
    const languagesList = languagesWithEnglish.join("\n- ");

    const firstSentence =
      wordsToTranslate.words.length == 1
        ? `Translate this word ${wordsToTranslate.words} into the languages:`
        : `Translate these words ${wordsToTranslate.words} into the languages:`;

    const messageContent = `${firstSentence}
    - ${languagesList}
    The response should contain a property words which is an array with each element presenting each words in multiple languages in json array format following the format of this interface:
   ${JSON.stringify(wordMeaningArray, null, 2)}`;
    return messageContent;
  }

  /**
   * Treats the request before sending it to the ChatGPT model.
   * @param {Request<ParamsDictionary>} request The request object.
   * @return {string} The modified request object.
   */

  override treatAIReply(chatGPTReply: GenerateContentResult): GivenWords {
    const treatedChatGPTReply = super.treatAIReply(chatGPTReply);
    return treatedChatGPTReply;
  }

  override checkAnswer(input: WordsToTranslate, answer: GivenWords): void {
    if (
      !(
        input.words.length == answer.words.length &&
        input.languages.every((language) =>
          answer.words.every((word) => word.hasOwnProperty(language)),
        )
      )
    ) {
      console.log("input", input);
      answer.words.forEach((word) => {
        console.log("answer", word);
      });
      throw new Error("The answer does not match the request");
    }
  }
}

/**
 * Handler for the giveMeTwoWords request.
 */
export const translateWordsRequest: HttpsFunction = onRequest(
  { cors: true },
  async (request: Request, response: Response) => {
    const newCommunicateWithChatGP = new TranslateWordsContainer();

    await newCommunicateWithChatGP.communicateOnRequest(request, response);
  },
);

export const translateWords = async (
  request: WordsToTranslate,
): Promise<GivenWords> => {
  const newCommunicateWithChatGP = new TranslateWordsContainer();

  return await newCommunicateWithChatGP.communicate(request);
};
