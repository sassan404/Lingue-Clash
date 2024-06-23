
import {CommunicateWithChatGP} from "./communicateWithChatGPT";
import {ParamsDictionary} from "express-serve-static-core";
import {Request} from "firebase-functions/v1";

// Define the interface structure as a constant object
const SentenceReply = {
  language: "string",
  words: "string[]",
  sentence: "string",
} as const;
/**
 * Container class for the 'giveMeTwoWords' function.
 */
class GiveMeASentenceContainer extends CommunicateWithChatGP {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {Languages} languages the languages to be used.
   * @return {String} The message.
   */
  private message = (languages: SentenceRules) =>
    `I need one sentence in ${languages.language} with the words ${languages.words}.
  Feel free to make a couple of mistakes (completely optional).
  The response should be a json array following the format of this interface::
  ${JSON.stringify(SentenceReply, null, 2)}`;

  /**
   * Treats the request before sending it to the ChatGPT model.
   * @param {Request<ParamsDictionary>} request The request object.
   * @return {string} The modified request object.
   */
  override treatRequest(request: Request<ParamsDictionary>): string {
    const requestBody: SentenceRules = request.body;
    return this.message(requestBody);
  }
}

const giveMeASentenceContainer = new GiveMeASentenceContainer();

export const giveMeASentence = giveMeASentenceContainer.communicate;

  interface SentenceRules {
    language: string;
    words: string[];
  }
