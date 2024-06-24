import {CommonModule} from '@angular/common';
import {Component, Injectable} from '@angular/core';

import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css'
})

@Injectable({providedIn: 'root'})
export class CreateRoomComponent {
  roomCode: string | null = null;

  createRoomForm = new FormGroup({
    username: new FormControl(''),
    language: new FormControl(''),
  });
  private apiUrl = 'http://127.0.0.1:5001/word-clash-2aa96/us-central1/createRoom';

  constructor(private router: Router, private http: HttpClient) {
  }

  createRoom() {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    const body = JSON.stringify({
      username: this.createRoomForm.value.username,
      language: this.createRoomForm.value.language
    });
    this.http.put(this.apiUrl, {headers, body}).subscribe(
      response => {
        console.log('Room created successfully', response);
      },
      error => {
        console.error('Error creating room', error);
      }
    )
  }
}

interface CreateResponse {
  roomCode: string;
}
