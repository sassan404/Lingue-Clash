import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs! Updated!", { structuredData: true });
  const requestBody: WordMeaning[] = request.body;

  const words = requestBody.map((wordMeaning) => wordMeaning.word).toString();

  const reponseContent = "Hello from Firebase!\nWe got your request!\n" + words;
  response.send(reponseContent);
});

interface WordMeaning {
  word: string;
  meaning: string;
}
