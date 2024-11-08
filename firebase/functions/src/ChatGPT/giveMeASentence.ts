import { HttpsFunction, onRequest } from "firebase-functions/v2/https";
import { SentenceReply } from "../../../../common/Interfaces/TreatedChatGPTStructure";
import { SentenceRules } from "../../../../common/Interfaces/TreatedRequest";
import { CommunicateWithChatGP } from "./CommunicateWithChatGPT";
import { Request, Response } from "firebase-functions/v1";

// Define the interface structure as a constant object
const sentenceReply = {
  language: "string",
  words: "string[]",
  sentence: "string",
} as const;

/**
 * Container class for the 'giveMeTwoWords' function.
 */
class GiveMeASentenceContainer extends CommunicateWithChatGP<
  SentenceRules,
  SentenceReply
> {
  /**
   * Message to be sent to the ChatGPT model.
   * @param {Languages} languages the languages to be used.
   * @return {String} The message.
   */
  override message(languages: SentenceRules): string {
    return `I need one sentence in ${languages.language} with the words ${languages.words}.
  Feel free to make a couple of mistakes (completely optional).
  The response should be a json array following the format of this interface::
  ${JSON.stringify(sentenceReply, null, 2)}`;
  }
}

/**
 * Handler for the giveMeTwoWords request.
 */
export const giveMeASentenceRequest: HttpsFunction = onRequest(
  async (request: Request, response: Response) => {
    const newCommunicateWithChatGP = new GiveMeASentenceContainer();

    await newCommunicateWithChatGP.communicateOnRequest(request, response);
  },
);
