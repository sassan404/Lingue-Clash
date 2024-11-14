// types of requests bosy received by the functions (onRequest)
export interface InitiateNewRoundRequest {
  roomId: string;
}

export interface CreateRoomRequest {
  username: string;
  language: string;
}

export interface JoinRoomRequest {
  username: string;
  language: string;
  roomCode: string;
}

export interface LeaveRoomRequest {
  roomId: string;
  username: string;
}


export interface RoomPropertiesUpdateRequest {
  numberOfRounds: number;
  numberofWords: number;
  wordsList: string[];
  roomId: string;
}