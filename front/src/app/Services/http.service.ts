import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateRoomRequest,
  JoinRoomRequest,
} from '@common/Interfaces/Requests';

@Injectable({ providedIn: 'root' })
export class HTTPService {
  constructor(private http: HttpClient) {}

  private apiUrl = (functionName: string) =>
    `https://${functionName.toLowerCase()}-tvyvmn36ya-uc.a.run.app`;
  // 'http://127.0.0.1:5001/word-clash-2aa96/us-central1/' + functionName;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  createRoom(creation: CreateRoomRequest) {
    const body = JSON.stringify({
      username: creation.username,
      language: creation.language,
    });
    return this.http.post(this.apiUrl('createRoom'), body, {
      headers: this.headers,
    });
  }

  joinRoom(joining: JoinRoomRequest) {
    const body = JSON.stringify({
      roomCode: joining.roomCode,
      username: joining.username,
      language: joining.language,
    });

    return this.http.post(this.apiUrl('joinRoom'), body, {
      headers: this.headers,
    });
  }

  setPlayerReady(roomId: string, username: string) {
    const body = JSON.stringify({
      roomId,
      username,
    });

    this.http
      .post(this.apiUrl('setPlayerReady'), body, {
        headers: this.headers,
      })
      .subscribe();
  }

  submitPlayerAnswer(roomId: string, username: string, answer: string) {
    const body = JSON.stringify({
      roomId,
      username,
      answer,
    });

    this.http
      .post(this.apiUrl('submitPlayerAnswer'), body, {
        headers: this.headers,
      })
      .subscribe();
  }
}
