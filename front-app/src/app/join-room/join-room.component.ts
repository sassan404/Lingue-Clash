import {Component} from '@angular/core';

import {getFunctions, httpsCallable} from '@angular/fire/functions';
import {Router} from '@angular/router';

import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.css'
})
export class JoinRoomComponent {


  joinRoomForm = new FormGroup({
    username: new FormControl(''),
    language: new FormControl(''),
    roomCode: new FormControl(''),
  });

  constructor(private router: Router) {
  }

  joinRoom() {
    const functions = getFunctions();
    const joinRoomCallable = httpsCallable(functions, 'joinRoom');
    joinRoomCallable({
      roomCode: this.joinRoomForm.value.roomCode,
      username: this.joinRoomForm.value.username,
      language: this.joinRoomForm.value.language
    }).then(async result => {
      const data = result.data as JoinResponse;
      console.log(`User ${this.joinRoomForm.value.username} joined room with code: ${data.roomCode}`);
      await this.router.navigate(['/']);
    }, error => {
      console.error('Error joining room:', error);
    });
  }
}

interface JoinResponse {
  roomCode: string;
}
