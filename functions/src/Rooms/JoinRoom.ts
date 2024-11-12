import { onRequest } from "firebase-functions/v2/https";
import { database } from "../realtime-db.config";
import { JoinRoomRequest } from "../../../front/common/Interfaces/Requests";
import { JoinRoomResponse } from "../../../front/common/Interfaces/Responses";
import {
  PlayerStates,
  RoundTypes,
} from "../../../front/common/Interfaces/enums";
import { StartFinishRoundHelper } from "./Helpers/StartFinishRoundHelper";

export const joinRoom = onRequest({ cors: true }, async (request, response) => {
  const { roomCode, username, language } = request.body as JoinRoomRequest;

  const roomSnapshot = await database
    .ref("rooms")
    .orderByChild("roomCode")
    .equalTo(roomCode)
    .once("value");

  if (!roomSnapshot.exists()) {
    console.log("Invalid room code");
    return;
  }

  const roomId = Object.keys(roomSnapshot.val())[0];

  const roomRef = roomSnapshot.ref.child(`${roomId}`);

  const currentRoundType = (
    await roomRef.child("currentRound/type").once("value")
  ).val();

  if (currentRoundType !== RoundTypes.LOBBY) {
    console.log("Room is not in lobby");
    response.send({ error: "Room is not in lobby phase, player can't join" });
    return;
  }
  const isRoomLocked = (await roomRef.child("locked").once("value")).val();

  if (isRoomLocked) {
    console.log("Room is locked");
    response.send({ response: "Room is locked" });
    return;
  }

  await roomRef.update({
    isLocked: true,
  });

  const playerRef = roomRef.child(`players/${username}`);

  await playerRef.set({
    username,
    state: PlayerStates.WAITING,
    language,
    score: 0,
    joinedAt: Date.now(),
    joinedAtTimestamp: new Date().toISOString(),
  });

  const roundHelper = new StartFinishRoundHelper(roomRef);
  playerRef.child("state").on("value", async (snapshot) => {
    if (snapshot) {
      await roundHelper.listenToPlayersStateChange();
    }
  });

  const languagesRef = roomRef.child("languages");
  const languagesSnapshot = await languagesRef.once("value");

  let languagesArray = languagesSnapshot.val();

  const languagesSet = new Set(languagesArray);

  // Add the new language if it's not already present
  languagesSet.add(language);

  // Update the languages array in the room
  await languagesRef.set(Array.from(languagesSet));

  await roomRef.update({
    isLocked: false,
  });

  const reponseContent: JoinRoomResponse = { roomId };
  response.send(reponseContent);
});
