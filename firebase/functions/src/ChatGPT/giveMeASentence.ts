import {
  SentenceReply,
  SentenceRules,
} from "../../../../common/Interfaces/Interfaces";
import { CommunicateWithChatGP } from "./CommunicateWithChatGPT";

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

const giveMeASentenceContainer = new GiveMeASentenceContainer();

export const giveMeASentenceRequest =
  giveMeASentenceContainer.communicateOnRequest;
