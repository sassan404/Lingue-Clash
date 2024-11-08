import { HttpsFunction, onRequest } from "firebase-functions/v2/https";
import { GivenWords } from "../../../../common/Interfaces/GivenWord";
import { Languages } from "../../../../common/Interfaces/TreatedRequest";

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
 * Container class for the 'giveMeWords' function.
 */
class GiveMeWordsContainer extends CommunicateWithChatGP<
  Languages,
  GivenWords
> {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {Languages} languages the languages to be used.
   * @return {String} The message.
   */
  override message(languages: Languages): string {
    const languagesWithEnglish =
      languages.languages.indexOf("English") < 0
        ? ["English", ...languages.languages]
        : languages.languages;
    const languagesList = languagesWithEnglish.join("\n- ");

    const firstSentence =
      languages.wordNumber == 1
        ? `I need ${languages.wordNumber} random word with its translations into the languages:`
        : `I need ${languages.wordNumber} different random words each with its translations into the languages:`;

    const messageContent = `${firstSentence}
    - ${languagesList}
   The response should be a json array following the format of this interface:
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

  override checkAnswer(input: Languages, answer: GivenWords): boolean {
    return (
      input.wordNumber == answer.words.length &&
      input.languages.every((language) =>
        answer.words.every((word) => word.hasOwnProperty(language)),
      )
    );
  }
}

/**
 * Handler for the giveMeTwoWords request.
 */
export const giveMeWordsRequest: HttpsFunction = onRequest(
  async (request: Request, response: Response) => {
    const newCommunicateWithChatGP = new GiveMeWordsContainer();

    await newCommunicateWithChatGP.communicateOnRequest(request, response);
  },
);

export const giveMeWords = async (request: Languages): Promise<GivenWords> => {
  const newCommunicateWithChatGP = new GiveMeWordsContainer();

  return await newCommunicateWithChatGP.communicate(request);
};