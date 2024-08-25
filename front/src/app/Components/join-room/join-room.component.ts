import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  HTTPService,
  CreateRequest,
  JoinRoomResponse,
  JoinRequest,
} from '../../Services/http.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
@Component({
  selector: 'app-join-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatButtonModule,
    AsyncPipe,
    LanguageSelectorComponent,
  ],
  templateUrl: './join-room.component.html',
  styleUrl: './join-room.component.css',
})
export class JoinRoomComponent {
  joinRoomForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    language: new FormControl(''),
    roomCode: new FormControl('', [Validators.required]),
  });

  constructor(
    private router: Router,
    private httpService: HTTPService,
  ) {}

  joinRoom() {
    const joinRequest: JoinRequest = {
      username: this.joinRoomForm.value.username || '',
      roomCode: this.joinRoomForm.value.roomCode || '',
      language: this.joinRoomForm.value.language || '',
    };
    this.httpService.joinRoom(joinRequest).subscribe((reply) => {
      const typedReply = reply as JoinRoomResponse;
      this.router.navigate(['/room'], {
        queryParams: { roomId: typedReply.roomId, playerUsername: joinRequest.username },
      });
    });
  }
}
