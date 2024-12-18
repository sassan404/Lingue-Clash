import { onRequest } from "firebase-functions/v2/https";
import { CreateRoomRequest } from "../../../front/common/Interfaces/Requests";
import { CreateRoomResponse } from "../../../front/common/Interfaces/Responses";
import {
  GameModes,
  PlayerStates,
  RoundStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import { Reference } from "firebase-admin/database";
import { database } from "../realtime-db.config";
import { warn } from "firebase-functions/logger";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(4, 8).toUpperCase();
};

export const createRoom = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      let { username, language, mode } = request.body as CreateRoomRequest;

      username = mode === GameModes.ADMIN ? "Admin" : username;

      const roomCode = generateRoomCode();

      const roomRef: Reference = database.ref("rooms").push();
      const roomId = roomRef.key as string; // Get the room ID and Assert that it is a string

      database.ref("roomCodes").update({ [roomCode]: roomId });

      const currentTime = Date.now();
      const currentTimestamp = new Date(currentTime);
      const currentTimeISOString = currentTimestamp.toISOString();

      const adminPlayer =
        mode === GameModes.ADMIN
          ? {}
          : {
              [username]: {
                state:
                  mode === GameModes.SOLO
                    ? PlayerStates.READY
                    : PlayerStates.WAITING,
                username: username,
                language: language,
                score: 0,
                joinedAt: currentTime,
                joinedAtTimestamp: currentTimeISOString,
              },
            };
      await roomRef.set({
        roomId: roomId,
        roomName: `Room created by ${username}`,
        roomCode: roomCode,
        createdBy: username,
        createdAt: currentTime,
        mainLanguage: language ?? "English",
        createdAtTimestamp: currentTimeISOString,
        isLocked: false,
        progress: 0,
        roundCanStart: false,
        gameMode: mode,
        numberOfRounds: 5,
        numberofWords: 6,
        wordsList: [],
        currentRound: {
          startAt: currentTime,
          startAtTimestamp: currentTimeISOString,
          state: RoundStates.STARTING,
          type: RoundTypes.LOBBY,
        },
        currentRoundNumber: 0,
        languages: [language ?? "English"],
        players: adminPlayer,
        rounds: {},
      });

      const reponseContent: CreateRoomResponse = { roomCode, roomId };
      response.send(reponseContent);
    } catch (error) {
      warn((error as Error).message);
      response.status(500).send(error);
    }
  },
);
