export interface CreateRoomResponse {
  roomCode: string;
  roomId: string;
}

export interface JoinRoomResponse {
  roomId: string;
}

export interface PlayerAnswer {
  roomId: string;
  username: string;
  answer: string;
}

export interface LeaveRoomResponse {
  roomId: string;
  event: string;
}
