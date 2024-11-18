import { ComponentType } from '@angular/cdk/portal';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import {
  CreateRoomRequest,
  JoinRoomRequest,
  RoomPropertiesUpdateRequest,
} from '@common/Interfaces/Requests';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class HTTPService {
  config!: MatSnackBarConfig;
  constructor(
    private http: HttpClient,
    public snackbar: MatSnackBar,
  ) {
    const config = new MatSnackBarConfig();
    config.duration = 2000;
    config.horizontalPosition = 'right';
    config.verticalPosition = 'top';
  }

  private apiUrl = (functionName: string) =>
    environment.production
      ? `https://${functionName.toLowerCase()}-tvyvmn36ya-ew.a.run.app`
      : 'http://127.0.0.1:5001/word-clash-2aa96/europe-west1/' + functionName;

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  openSnackBarOnErrors(error: HttpErrorResponse) {
    this.snackbar.open(error?.error?.message, '', this.config);
  }

  createRoom(creation: CreateRoomRequest) {
    const body = JSON.stringify({
      username: creation.username,
      language: creation.language,
      mode: creation.mode,
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
      .subscribe({ error: this.openSnackBarOnErrors });
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
      .subscribe({ error: this.openSnackBarOnErrors });
  }

  getWordSuggestion(numberOfWords: number, language: string) {
    const body = JSON.stringify({
      wordNumber: numberOfWords,
      languages: [language],
    });
    return this.http.post(this.apiUrl('giveMeWords'), body, {
      headers: this.headers,
    });
  }

  updateGameProperties(
    numberOfRounds: number,
    numberOfWords: number,
    wordsList: string[],
    roomId: string,
  ) {
    const body: RoomPropertiesUpdateRequest = {
      numberOfRounds,
      numberofWords: numberOfWords,
      wordsList,
      roomId,
    };
    const bosyAsString = JSON.stringify(body);

    this.http
      .post(this.apiUrl('updateRoomProperties'), bosyAsString, {
        headers: this.headers,
      })
      .subscribe({ error: this.openSnackBarOnErrors });
  }

  startNewRound(roomId: string) {
    const body = JSON.stringify({
      roomId: roomId,
    });

    this.http
      .post(this.apiUrl('startNewRound'), body, {
        headers: this.headers,
      })
      .subscribe({ error: this.openSnackBarOnErrors });
  }
}
