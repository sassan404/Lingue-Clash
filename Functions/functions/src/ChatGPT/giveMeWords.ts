
import {CommunicateWithChatGP} from "./CommunicateWithChatGPT";
import {ParamsDictionary} from "express-serve-static-core";
import {Request} from "firebase-functions/v1";

// Define the interface structure as a constant object

const translation = {
  language: "string",
  word: "string",
} as const;
const WordMeaningStructure = {
  wordInEnglish: "string",
  translation: [translation],
} as const;
/**
 * Container class for the 'giveMeWords' function.
 */
class GiveMeWordsContainer extends CommunicateWithChatGP {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {Languages} languages the languages to be used.
   * @return {String} The message.
   */
  private message = (languages: Languages) =>
    `I need ${languages.wordNumber} different random words each translated into two the languages:
   - ${languages.firstLanguage} 
   - ${languages.secondLanguage}
  The response should be a json array following the format of this interface:
  ${JSON.stringify(WordMeaningStructure, null, 2)}`;

  /**
   * Treats the request before sending it to the ChatGPT model.
   * @param {Request<ParamsDictionary>} request The request object.
   * @return {string} The modified request object.
   */
  override treatRequest(request: Request<ParamsDictionary>): string {
    const requestBody: Languages = request.body;
    return this.message(requestBody);
  }
}

const giveMeWordsContainer = new GiveMeWordsContainer();

export const giveMeWords = giveMeWordsContainer.communicate;

  interface Languages {
    wordNumber: number;
    firstLanguage: string;
    secondLanguage: string;
  }


