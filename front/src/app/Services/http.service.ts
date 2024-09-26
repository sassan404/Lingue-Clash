import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Database,
  ref,
  onValue,
  query,
  Unsubscribe
} from '@angular/fire/database';
import {
  CreateRoomRequest,
  JoinRoomRequest,
  Player,
  RoomContainer,
  RoomStates,
  RoundContainer,
  RoundStates,
} from '../../../../common/Interfaces/Interfaces';

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
  roundSubject = new Subject<RoundContainer>();
  roundCanStartSubject = new Subject<boolean>();

  createRoom(creation: CreateRoomRequest) {
    const body = JSON.stringify({
      username: creation.username,
      language: creation.language,
    });
    return this.http.put(this.apiUrl + 'createRoom', body, {
      headers: this.headers,
    });
  }

  joinRoom(joining: JoinRoomRequest) {
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

  submitPlayerAnswer(roomId: string, username: string, answer: string){
    const body = JSON.stringify({
      roomId,
      username,
      answer
    });

    console.log('submitPlayerAnswer', body);
    this.http
      .put(this.apiUrl + 'submitPlayerAnswer', body, {
        headers: this.headers,
      })
      .subscribe();
  }

  getRoomUpdates(roomId: string, playerUsername: string): Unsubscribe {
    const roomRef = ref(this.database, 'rooms/' + roomId);
    const result = onValue(query(roomRef), (snapshot) => {
      const room: RoomContainer = snapshot.val();
      console.log(room);
      if (room != null) {
        if (room.roomCode != undefined) {
          this.roomCodeSubject.next(room.roomCode);
        }
        if (room.players !== undefined) {
          const playersArray: Player[] = Object.values(room.players);
          this.playersSubject.next(playersArray);
          this.playerSubject.next(room.players[playerUsername]);
        }
        if (room.currentRound !== undefined) {
          this.roundNumberSubject.next(room.currentRound);
        }
        if (room.rounds !== undefined) {
          // Do something with rounds
          console.log('round number', room.currentRound);
          console.log('round', room.rounds[room.currentRound]);
          this.roundSubject.next(room.rounds[room.currentRound]);
        }
        if (room.state !== undefined) {
          this.roomStateSubject.next(room.state);
        }
        this.roundCanStartSubject.next(room.roundCanStart);
      } else {
        this.roomCodeSubject.next(null);
        this.playersSubject.next([]);
      }
    });
    return result;
  }

  listenToCountdown(
    roomId: string,
    roundNumber: number,
    countDownSubject: Subject<number>,
  ): Unsubscribe {
    const countDownRef = ref(
      this.database,
      'rooms/' + roomId + '/rounds/' + roundNumber + '/countDown',
    );
    const countdownSubscription = onValue(query(countDownRef), (snapshot) => {
      countDownSubject.next(snapshot.val());
    });
    return countdownSubscription;
  }

  listenToState(
    roomId: string,
    roundNumber: number,
    stateSubject: Subject<RoundStates>,
  ) {
    const roundStateRef = ref(
      this.database,
      'rooms/' + roomId + '/rounds/' + roundNumber + '/state',
    );
    const stateSubscription = onValue(query(roundStateRef), (snapshot) => {
      stateSubject.next(snapshot.val());
    });
    return stateSubscription;
  }
}
