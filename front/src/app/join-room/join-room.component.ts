import {Component} from '@angular/core';

import {Router} from '@angular/router';

import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from "@angular/common";
import { HTTPService, JoinRequest } from '../http.service';

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

  constructor(private router: Router, private httpService: HTTPService) {
  }

  joinRoom() {
    const joinRequest: JoinRequest = {
      username: this.joinRoomForm.value.username || '',
      roomCode: this.joinRoomForm.value.roomCode || '',
      language: this.joinRoomForm.value.language || ''
  }
    this.httpService.joinRoom(joinRequest);
  }
}
