import { defineString } from "firebase-functions/params";
import { onInit } from "firebase-functions/v2/core";

import OpenAI from "openai";

const CHATGPT_APIKEY = defineString("CHATGPT_APIKEY");
const CHATGPT_ORGANIZATION = defineString("CHATGPT_ORGANIZATION");
const CHATGPT_PROJECT = defineString("CHATGPT_PROJECT");

// Wrapper to apply secrets to functions
// export const onRequestWithSecrets = (
//   handler: (
//     request: Request,
//     response: Response,
//     openai: OpenAI,
//   ) => void | Promise<void>,
// ): HttpsFunction => {
//   return onRequest(
//     { secrets: [CHATGPT_APIKEY, CHATGPT_ORGANIZATION, CHATGPT_PROJECT] },
//     async (request: Request, response: Response) => {
//       const apiKey = CHATGPT_APIKEY.value();
//       const organization = CHATGPT_ORGANIZATION.value();
//       const project = CHATGPT_PROJECT.value();
//       log.apply("info", ["API Key: ", apiKey]);
//       log.apply("info", ["organization: ", organization]);
//       log.apply("info", ["project: ", project]);
//       const openai: OpenAI = new OpenAI({
//         apiKey: apiKey,
//         organization: CHATGPT_ORGANIZATION.value(),
//         project: CHATGPT_PROJECT.value(),
//       });
//       handler(request, response, openai);
//     },
//   );
// };

let openai: OpenAI;

onInit(() => {
  openai = new OpenAI({
    apiKey: CHATGPT_APIKEY.value(),
    organization: CHATGPT_ORGANIZATION.value(),
    project: CHATGPT_PROJECT.value(),
  });
});

export { openai };
