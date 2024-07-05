import {CommonModule} from '@angular/common';
import {Component, Injectable} from '@angular/core';

import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { HTTPService, CreateRequest } from '../http.service';

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
 

  constructor(private httpService: HTTPService) {
  }

  createRoom() {
    const createRequest: CreateRequest = {
      username: this.createRoomForm.value.username || '',
      language: this.createRoomForm.value.language || ''
    };
    this.httpService.createRoom(createRequest);
  }
}

