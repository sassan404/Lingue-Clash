/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { giveMeWordsRequest } from "./ChatGPT/GiveMeWords";
import { evaluateOneSentenceRequest } from "./ChatGPT/EvaluateOneSentence";
import { translateWordsRequest } from "./ChatGPT/TranslateWords";
import { createRoom } from "./Rooms/CreateRoom";
import { joinRoom } from "./Rooms/JoinRoom";
import { setPlayerReady } from "./Rooms/SetPlayerReady";
import { submitPlayerAnswer } from "./Rooms/SubmitPlayerAnswer";
import { updateRoomProperties } from "./Rooms/UpdateRoomProperties";
import { startNewRound } from "./Rooms/StartNewRound";

import { helloWorld } from "./helloWorld";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export {
  giveMeWordsRequest as giveMeWords,
  helloWorld,
  createRoom,
  joinRoom,
  setPlayerReady,
  evaluateOneSentenceRequest as evaluateTheSentence,
  submitPlayerAnswer,
  translateWordsRequest as translateWords,
  updateRoomProperties,
  startNewRound,
};
