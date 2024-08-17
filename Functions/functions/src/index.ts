/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { giveMeWordsRequest } from "./ChatGPT/giveMeWords";
import { giveMeASentenceRequest } from "./ChatGPT/giveMeASentence";
import { evaluateTheSentencesRequest } from "./ChatGPT/evaluateTheSentences";
import { createRoom } from "./Rooms/CreateRoom";
import { leaveRoom } from "./Rooms/LeaveRoom";
import { onCreateRoom, deleteExpiredRooms } from "./Rooms/deletingRooms";
import { initiateNewRound } from "./Rooms/IncrementRound";
import { joinRoom } from "./Rooms/JoinRoom";
import { startNewRound } from "./Rooms/StartNewRound";

import { helloWorld } from "./helloWorld";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export {
  giveMeWordsRequest as giveMeWords,
  giveMeASentenceRequest as giveMeASentence,
  evaluateTheSentencesRequest as evaluateTheSentences,
  helloWorld,
  createRoom,
  onCreateRoom,
  deleteExpiredRooms,
  initiateNewRound,
  joinRoom,
  startNewRound,
  leaveRoom,
};
