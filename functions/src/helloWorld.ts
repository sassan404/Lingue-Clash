import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs! Updated!", { structuredData: true });
  const reponseContent = "Hello from Firebase!\nWe got your request!\n";
  response.send(reponseContent);
});
