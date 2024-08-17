import OpenAI from "openai";

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { Request, Response } from "firebase-functions/v1";
import { ChatCompletion } from "openai/resources";

const CHATGPT_APIKEY = defineSecret("CHATGPT_APIKEY");
const CHATGPT_ORGANIZATION = defineSecret("CHATGPT_ORGANIZATION");
const CHATGPT_PROJECT = defineSecret("CHATGPT_PROJECT");

/**
 * CommunicateWithChatGP class.
 */
export class CommunicateWithChatGP {
  /**
   * Treat the request.
   * @param {Request} request - The response object.
   * @return {string} The treated response object.
   */
  treatRequest(request: Request): string {
    return request.body;
  }

  /**
   * Treat the response.
   * @param {Response} response - The response object.
   * @return {Response} The treated response object.
   */
  treatResponse(response: Response): Response {
    return response;
  }

  /**
   * Treat the response.
   * @param {ChatCompletion} chatGPTReply - The reply from chatGPT.
   * @return {string} The treated response object.
   */
  treatChatGPTReply(chatGPTReply: ChatCompletion): JSON {
    return JSON.parse(
      chatGPTReply.choices.find(
        (choice) => choice.message && choice.message.content != null,
      )?.message.content ?? "",
    );
  }

  /**
   * Handler for the giveMeTwoWords request.
   */
  public communicate = onRequest(
    { secrets: [CHATGPT_APIKEY, CHATGPT_ORGANIZATION, CHATGPT_PROJECT] },
    async (request, response) => {
      const openai = new OpenAI({
        apiKey: CHATGPT_APIKEY.value(),
        organization: CHATGPT_ORGANIZATION.value(),
        project: CHATGPT_PROJECT.value(),
      });
      const treatedRequestBody = this.treatRequest(request);

      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: treatedRequestBody }],
        model: "gpt-3.5-turbo",
      });

      const treatedResponse = this.treatResponse(response);

      const treatedChatGPTReply = this.treatChatGPTReply(chatCompletion);
      treatedResponse.send(treatedChatGPTReply);
    },
  );
}
