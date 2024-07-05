import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Database, ref } from '@angular/fire/database';
@Injectable({providedIn: 'root'})
export class HTTPService {
  constructor(private http: HttpClient) {
    // This service can now make HTTP requests via `this.http`.
  }

  private database = inject(Database);

  private apiUrl = 'http://127.0.0.1:5001/word-clash-2aa96/us-central1/';

  private headers = new HttpHeaders({'Content-Type': 'application/json'});

  createRoom(creation: CreateRequest) {
    
    const body = JSON.stringify({
      username: creation.username,
      language: creation.language
    });
    this.http.put(this.apiUrl + 'createRoom', body, {headers: this.headers}).subscribe(
      response => {
        console.log('Room created successfully', response);
      },
      error => {
        console.error('Error creating room', error);
      }
    )
  }


  joinRoom(joining: JoinRequest) {
   
    const body = JSON.stringify({
        roomCode: joining.roomCode,
        username: joining.username,
        language: joining.language
    })
  
    this.http.put(this.apiUrl + 'joinRoom', body, {headers: this.headers}).subscribe(
      response => {
        console.log('Room joined successfully', response);
      },
      error => {
        console.error('Error joining room', error);
      }
    )
    };


    getPlayerUpdates(roomCode: string) {
      

      const roomsRef = ref(this.database, 'rooms/roomCode')
      const roomSnapshot = await roomsRef.orderByChild("roomCode").equalTo(roomCode).once("value");


      const url = 'https://word-clash-2aa96-default-rtdb.europe-west1.firebasedatabase.app/rooms/-O05TOJqS2G1yeL4MdtL/players.json'
      const headers = new HttpHeaders({
        'Connection': 'keep-alive', 
        'Accept': 'text/event-stream', 
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      return this.http.get(url, {headers: headers});
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