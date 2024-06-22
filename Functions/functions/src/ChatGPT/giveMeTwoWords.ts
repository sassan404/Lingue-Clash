import OpenAI from "openai";


import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";


const CHATGPT_APIKEY = defineSecret("CHATGPT_APIKEY");
const CHATGPT_ORGANIZATION = defineSecret("CHATGPT_ORGANIZATION");
const CHATGPT_PROJECT = defineSecret("CHATGPT_PROJECT");


export const giveMeTwoWords = onRequest(
  {secrets: [CHATGPT_APIKEY, CHATGPT_ORGANIZATION, CHATGPT_PROJECT]},
  async (request, response) => {
    const openai = new OpenAI({
      apiKey: CHATGPT_APIKEY.value(),
      organization: CHATGPT_ORGANIZATION.value(),
      project: CHATGPT_PROJECT.value(),
    });

    const requesTBody: Languages = request.body;

    const chatGPTRequestContent = "I need two different words in " +
    requesTBody.firstLanguage + " and " +
    requesTBody.secondLanguage + " and their meanings in English.\n" +
    "The response should be in the format: " +
    `interface WordMeaning {
    wordInEnglish: string;
    translationInFirstLanguage: string;
    translationInSecondLanguage: string;
  }` + ".";


    const chatCompletion = await openai.chat.completions.create({
      messages: [{role: "user", content: chatGPTRequestContent}],
      model: "gpt-3.5-turbo",
    });


    response.send(chatCompletion.choices[0].message.content);
  });


  interface Languages {
    firstLanguage: string;
    secondLanguage: string;
  }
