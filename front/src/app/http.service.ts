import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Database, listVal, ref, list, onChildChanged, orderByChild,  onValue, query, Unsubscribe } from '@angular/fire/database';

import { where } from "firebase/firestore";
import { Observable, Subject } from "rxjs";
import { map, filter } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class HTTPService {
  constructor(private http: HttpClient) {
    // This service can now make HTTP requests via `this.http`.
  }

  private database = inject(Database);

  private apiUrl = 'http://127.0.0.1:5001/word-clash-2aa96/us-central1/';

  private headers = new HttpHeaders({'Content-Type': 'application/json'});

   roomcode = new Subject<string>()
   players = new Subject<Player[]>()

  createRoom(creation: CreateRequest) {
    
    const body = JSON.stringify({
      username: creation.username,
      language: creation.language
    });
    return this.http.put(this.apiUrl + 'createRoom', body, {headers: this.headers});
  }


  joinRoom(joining: JoinRequest) {
   
    const body = JSON.stringify({
        roomCode: joining.roomCode,
        username: joining.username,
        language: joining.language
    })
  
    return this.http.put(this.apiUrl + 'joinRoom', body, {headers: this.headers})
    };


    getRoomUpdates(roomId: string): Unsubscribe {
      

      const roomsRef = ref(this.database, 'rooms/' + roomId);
   
      const result = onValue(query(roomsRef), (snapshot) => 
        {
          const reply: RoomContainer = snapshot.val();
          console.log(reply)
          if(reply.roomCode != undefined){
            this.roomcode.next(reply.roomCode);
          }
          if (reply.players !== undefined) {
            console.log(reply.players);
            const playersArray: Player[] = Object.values(reply.players);
            console.log(playersArray);
            this.players.next(playersArray);
          }

    }
  );
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
}