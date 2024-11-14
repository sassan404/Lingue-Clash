import { onRequest } from "firebase-functions/v2/https";
import { CreateRoomRequest } from "../../../front/common/Interfaces/Requests";
import { CreateRoomResponse } from "../../../front/common/Interfaces/Responses";
import {
  PlayerStates,
  RoundStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import { Reference } from "firebase-admin/database";
import { database } from "../realtime-db.config";
import { StartFinishRoundHelper } from "./Helpers/StartFinishRoundHelper";

const generateRoomCode = () => {
  return Math.random().toString(36).substring(4, 8).toUpperCase();
};

export const createRoom = onRequest(
  { cors: true },
  async (request, response) => {
    const { username, language } = request.body as CreateRoomRequest;

    const roomCode = generateRoomCode();

    const roomRef: Reference = database.ref("rooms").push();
    const roomId = roomRef.key as string; // Get the room ID and Assert that it is a string

    const currentTime = Date.now();
    const currentTimestamp = new Date(currentTime);
    const currentTimeISOString = currentTimestamp.toISOString();

    const adminPlayer = username
      ? {
          [username]: {
            state: PlayerStates.WAITING,
            username: username,
            language: language,
            score: 0,
            joinedAt: currentTime,
            joinedAtTimestamp: currentTimeISOString,
          },
        }
      : {};

    await roomRef.set({
      roomId: roomId,
      roomName: `Room created by ${username ?? "Admin"}`,
      roomCode: roomCode,
      createdBy: username ?? "Admin",
      createdAt: currentTime,
      mainLanguage: language ?? "English",
      createdAtTimestamp: currentTimeISOString,
      isLocked: false,
      progress: 0,
      roundCanStart: false,
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

    if (username) {
      const roundHelper = new StartFinishRoundHelper(roomRef);
      roomRef
        .child("players/" + username + "/state")
        .on("value", async (snapshot) => {
          if (snapshot) {
            await roundHelper.listenToPlayersStateChange();
          }
        });
    }

    const reponseContent: CreateRoomResponse = { roomCode, roomId };
    response.send(reponseContent);
  },
);
