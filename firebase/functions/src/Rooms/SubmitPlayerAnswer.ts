import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { Reference } from "@firebase/database-types";
import {
  GivenWords,
  Player,
  PlayerAnswer,
  PlayerStates,
  RoomContainer,
  RoomStates,
  RoundStates,
  Sentence,
  SentenceEvaluationReply,
} from "../../../../common/Interfaces/Interfaces";
import { evaluateTheSentence } from "../ChatGPT/evaluateTheSentence";

export const submitPlayerAnswer = onRequest(async (request, response) => {
  console.log("request.body: ", request.body);
  const { roomId, username, answer } = request.body as PlayerAnswer;

  const roomRef = database.ref(`rooms/${roomId}`);
  const roomSnapshot = await roomRef.once("value");

  if (!roomSnapshot.exists()) {
    console.log("Invalid room code");
    return;
  }

  await roomSnapshot.ref.update({
    state: RoomStates.LOADING,
  });

  const room: RoomContainer = roomSnapshot.val();

  console.log(
    `submitting answer for player: "${username}" in room: "${roomId}" and at rounnd "${room.currentRound}".`,
  );

  const sentence: Sentence = await buildSentence(roomRef, username, answer);

  await setPlayerAnswerForRound(roomRef, username, sentence);

  const playerRef = roomRef.child(`players/${username}`);

  await playerRef.update({
    state: PlayerStates.WAITING,
  });

  const players = (await roomRef.child("players").once("value")).val();
  const playersList: Player[] = Object.values(players);
  const allPlayersWaiting = playersList.every(
    (player: { state: PlayerStates }) => player.state === PlayerStates.WAITING,
  );

  if (allPlayersWaiting) {
    await finishRound(roomRef);
  } else {
    await roomRef.update({
      state: RoomStates.WAITING,
    });
  }

  const responseContent = {
    success: `Player: "${username}" asnwer was submitted in room: "${roomId}"`,
  };

  response.send(responseContent);
});

const finishRound = async (roomRef: Reference) => {
  const currentRound = (
    await roomRef.child("currentRound").once("value")
  ).val();
  console.log("Current round: ", currentRound);
  const roundRef = roomRef.child(`rounds/${currentRound}`);
  roundRef.set({
    state: RoundStates.FINISHED,
  });
  await roomRef.update({
    state: RoomStates.READY,
  });
};

const setPlayerAnswerForRound = async (
  roomRef: Reference,
  playerId: string,
  answer: Sentence,
) => {
  const sentenceEvaluation: SentenceEvaluationReply =
    await evaluateTheSentence(answer);
  const currentRound = (
    await roomRef.child("currentRound").once("value")
  ).val();
  console.log("Current round: ", currentRound);
  const resultRef = roomRef.child(`rounds/${currentRound}/result`);
  resultRef.set({
    [playerId]: sentenceEvaluation,
  });
  const playerRef = roomRef.child(`players/${playerId}`);
  (await playerRef.once("value")).val().score += sentenceEvaluation.score;
};

const buildSentence = async (
  roomRef: Reference,
  playerId: string,
  answer: string,
): Promise<Sentence> => {
  const playerRef = roomRef.child(`players/${playerId}`);

  const playerLanguage = (await playerRef.once("value")).val().language;

  const currentRound = (
    await roomRef.child("currentRound").once("value")
  ).val();
  console.log("Current round: ", currentRound);
  const roundRef = roomRef.child(`rounds/${currentRound}`);

  const words: GivenWords = (
    await roundRef.child("givenWords").once("value")
  ).val();

  const wordsForPlayerLanguage: string[] = words.map(
    (word) => word.translation[playerLanguage],
  );

  const sentence: Sentence = {
    language: playerLanguage,
    words: wordsForPlayerLanguage,
    sentence: answer,
  };

  return sentence;
};
