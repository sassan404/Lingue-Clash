import {CommonModule} from '@angular/common';
import {Component, Injectable} from '@angular/core';

import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { HTTPService, CreateRequest, JoinRoomResponse } from '../http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css'
})

@Injectable({providedIn: 'root'})
export class CreateRoomComponent {

  createRoomForm = new FormGroup({
    username: new FormControl(''),
    language: new FormControl(''),
  });
 

  constructor(private httpService: HTTPService,private router: Router) {
  }

  createRoom() {
    const createRequest: CreateRequest = {
      username: this.createRoomForm.value.username || '',
      language: this.createRoomForm.value.language || ''
    };
    this.httpService.createRoom(createRequest).subscribe(
      reply => {
        const typedReply = reply as JoinRoomResponse;
        this.router.navigate(['/room'], { queryParams: { roomCode: typedReply.roomCode } });
      },
    );
  }
}
