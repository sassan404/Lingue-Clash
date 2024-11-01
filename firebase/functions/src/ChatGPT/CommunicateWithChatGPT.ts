import { Request, Response } from "firebase-functions/v1";
import { ChatCompletion } from "openai/resources";
import { log } from "firebase-functions/logger";

import { ParamsDictionary } from "express-serve-static-core";

import { openai } from "../Utilities/OpenAI.utils";
import { HttpsFunction, onRequest } from "firebase-functions/v2/https";
import { TreatedRequest } from "../../../../common/Interfaces/TreatedRequest";
import { TreatedChatGPTStructure } from "../../../../common/Interfaces/TreatedChatGPTStructure";

/**
 * CommunicateWithChatGP class.
 * @param {U} TreatedRequest - The shape of the input received by the request
 * @param {T} TreatedChatGPTStructure - The shape of the reply from chatGPT
 */
export class CommunicateWithChatGP<
  U extends TreatedRequest,
  T extends TreatedChatGPTStructure,
> {
  /**
   * Treat the request.
   * @param {Request} request - The response object.
   * @return {string} The treated response object.
   */
  treatRequest(request: Request<ParamsDictionary>): U {
    const requestBody: U = request.body;
    return requestBody;
  }

  message(content: U): string {
    return content.toString();
  }
  /**
   * Treat the response.
   * @param {ChatCompletion} chatGPTReply - The reply from chatGPT.
   * @return {string} The treated response object.
   */
  treatChatGPTReply(chatGPTReply: ChatCompletion): T {
    const treatedReply = JSON.parse(
      chatGPTReply.choices.find(
        (choice) => choice.message && choice.message.content != null,
      )?.message.content ?? "",
    );
    return treatedReply;
  }

  /**
   * Handler for the giveMeTwoWords request.
   */
  public communicateOnRequest: HttpsFunction = onRequest(
    async (request: Request, response: Response) => {
      const treatedRequestBody: U = this.treatRequest(request);

      const treatedChatGPTReply = await this.communicate(treatedRequestBody);
      response.send(treatedChatGPTReply);
    },
  );

  public communicate = async (request: U): Promise<T> => {
    const messageTosend = this.message(request);

    let getAndTreatmentOfAnswerStatus = async () => {
      const answer = await this.buildChatGPTCompletion(messageTosend);
      const treatedAnswer = this.treatChatGPTReply(answer);
      if (this.checkAnswer(request, treatedAnswer)) {
        return treatedAnswer;
      }
      log.apply("alert", ["The answer was not as expected, trying again"]);
      return await getAndTreatmentOfAnswerStatus();
    };
    return await getAndTreatmentOfAnswerStatus();
  };

  buildChatGPTCompletion = async (message: string): Promise<ChatCompletion> => {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-3.5-turbo",
    });
    return chatCompletion;
  };

  checkAnswer(input: U, answer: T): boolean {
    return true;
  }
}
