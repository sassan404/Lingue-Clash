import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Database,
  ref,
  onValue,
  query,
  Unsubscribe,
} from '@angular/fire/database';

import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HTTPService {
  constructor(private http: HttpClient) {
    // This service can now make HTTP requests via `this.http`.
  }

  private database = inject(Database);

  private apiUrl = 'http://127.0.0.1:5001/word-clash-2aa96/us-central1/';

  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  roomCodeSubject = new Subject<string | null>();
  playersSubject = new Subject<Player[]>();
  roundNumberSubject = new Subject<number>();
  roomStateSubject = new Subject<RoomStates>();
  playerSubject = new Subject<Player>();

  createRoom(creation: CreateRequest) {
    const body = JSON.stringify({
      username: creation.username,
      language: creation.language,
    });
    return this.http.put(this.apiUrl + 'createRoom', body, {
      headers: this.headers,
    });
  }

  joinRoom(joining: JoinRequest) {
    const body = JSON.stringify({
      roomCode: joining.roomCode,
      username: joining.username,
      language: joining.language,
    });

    return this.http.put(this.apiUrl + 'joinRoom', body, {
      headers: this.headers,
    });
  }

  setPlayerReady(roomId: string, username: string) {
    const body = JSON.stringify({
      roomId,
      username,
    });

    console.log('setPlayerReady', body);
    this.http
      .put(this.apiUrl + 'setPlayerReady', body, {
        headers: this.headers,
      })
      .subscribe();
  }

  getRoomUpdates(roomId: string, playerUsername: string): Unsubscribe {
    const roomRef = ref(this.database, 'rooms/' + roomId);

    const result = onValue(query(roomRef), (snapshot) => {
      const reply: RoomContainer = snapshot.val();
      console.log(reply);
      if (reply != null) {
        if (reply.roomCode != undefined) {
          this.roomCodeSubject.next(reply.roomCode);
        }
        if (reply.players !== undefined) {
          const playersArray: Player[] = Object.values(reply.players);
          this.playersSubject.next(playersArray);
          this.playerSubject.next(reply.players[playerUsername]);
        }
        if (reply.currentRound !== undefined) {
          this.roundNumberSubject.next(reply.currentRound);
        }
        if (reply.state !== undefined) {
          this.roomStateSubject.next(reply.state);
        }
      } else {
        this.roomCodeSubject.next(null);
        this.playersSubject.next([]);
      }
    });
    return result;
  }
}

export interface CreateRequest {
  username: string;
  language: string;
}

export interface JoinRequest {
  roomCode: string;
  username: string;
  language: string;
}

export interface JoinRoomResponse {
  roomId: string;
}

export interface RoomContainer {
  roomId: string;
  roomCode: string;
  createdBy: string;
  state: RoomStates;
  currentRound: 0;
  roomName: string;
  players: {
    [playerId: string]: Player;
  };
  rounds: {
    [roundId: string]: any; // Define the structure of a round if needed
  };
}

export interface Player {
  joinedAt: number;
  language: string;
  score: number;
  username: string;
  state: PlayerStates;
}

export enum PlayerStates {
  WAITING = 'waiting',
  READY = 'ready',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export enum RoomStates {
  LOADING = 'loading',
  WAITING = 'waiting',
  READY = 'ready',
}
