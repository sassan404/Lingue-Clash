/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { giveMeWordsRequest } from "./ChatGPT/GiveMeWords";
import { giveMeASentenceRequest } from "./ChatGPT/GiveMeASentence";
import { evaluateTheSentencesRequest } from "./ChatGPT/EvaluateTheSentences";
import { evaluateOneSentenceRequest } from "./ChatGPT/EvaluateOneSentence";
import { translateWordsRequest } from "./ChatGPT/TranslateWords";
import { createRoom } from "./Rooms/CreateRoom";
import { leaveRoom } from "./Rooms/LeaveRoom";
import { joinRoom } from "./Rooms/JoinRoom";
import { setPlayerReady } from "./Rooms/SetPlayerReady";
import { submitPlayerAnswer } from "./Rooms/SubmitPlayerAnswer";
import { updateRoomProperties } from "./Rooms/UpdateRoomProperties";

import { helloWorld } from "./helloWorld";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export {
  giveMeWordsRequest as giveMeWords,
  giveMeASentenceRequest as giveMeASentence,
  evaluateTheSentencesRequest as evaluateTheSentences,
  helloWorld,
  createRoom,
  joinRoom,
  leaveRoom,
  setPlayerReady,
  evaluateOneSentenceRequest as evaluateTheSentence,
  submitPlayerAnswer,
  translateWordsRequest as translateWords,
  updateRoomProperties,
};
