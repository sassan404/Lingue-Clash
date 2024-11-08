import { Request, Response } from "firebase-functions/v1";
import { log } from "firebase-functions/logger";

import { ParamsDictionary } from "express-serve-static-core";

import { TreatedRequest } from "../../../../common/Interfaces/TreatedRequest";
import { TreatedAIReplyStructure } from "../../../../common/Interfaces/TreatedChatGPTStructure";

import {
  GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * CommunicateWithChatGP class.
 * @param {U} TreatedRequest - The shape of the input received by the request
 * @param {T} TreatedAIReplyStructure - The shape of the reply to the request
 */
export class CommunicateWithChatGP<
  U extends TreatedRequest,
  T extends TreatedAIReplyStructure,
> {
  /**
   * Treat the request.
   * @param {Request} request - The response object.
   * @return {U} The treated response object.
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
   * @param {GenerateContentResult} aiReply - The reply from chatGPT.
   * @return {string} The treated response object.
   */
  treatAIReply(aiReply: GenerateContentResult): T {
    const reply = aiReply.response.text();
    const jsonReply = reply.substring(
      reply.indexOf("{"),
      reply.lastIndexOf("}") + 1,
    );
    console.log(jsonReply);
    const treatedReply = JSON.parse(jsonReply);
    return treatedReply;
  }

  /**
   * Handler for the giveMeTwoWords request.
   */
  public communicateOnRequest = async (
    request: Request,
    response: Response,
  ) => {
    const treatedRequestBody: U = this.treatRequest(request);

    const treatedAIReply = await this.communicate(treatedRequestBody);
    response.send(treatedAIReply);
  };

  public communicate = async (request: U): Promise<T> => {
    const messageTosend = this.message(request);

    let getAndTreatmentOfAnswerStatus = async (): Promise<T> => {
      const answer = await this.buildAICommunication(messageTosend);
      const treatedAnswer = this.treatAIReply(answer);
      if (this.checkAnswer(request, treatedAnswer)) {
        return treatedAnswer;
      }
      log.apply("alert", ["The answer was not as expected, trying again"]);
      return await getAndTreatmentOfAnswerStatus();
    };
    return await getAndTreatmentOfAnswerStatus();
  };

  buildAICommunication = async (
    message: string,
  ): Promise<GenerateContentResult> => {
    const chatCompletion = await model.generateContent(message);
    return chatCompletion;
  };

  checkAnswer(input: U, answer: T): boolean {
    return true;
  }
}
