import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HTTPService } from '../../Services/http.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { JoinRoomRequest } from '@common/Interfaces/Requests';
import { JoinRoomResponse } from '@common/Interfaces/Responses';
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
    const joinRequest: JoinRoomRequest = {
      username: this.joinRoomForm.value.username || '',
      roomCode: this.joinRoomForm.value.roomCode || '',
      language: this.joinRoomForm.value.language || '',
    };
    this.httpService.joinRoom(joinRequest).subscribe({
      next: (reply) => {
        const typedReply = reply as JoinRoomResponse;
        this.router.navigate(['/room'], {
          queryParams: {
            roomId: typedReply.roomId,
            playerUsername: joinRequest.username,
          },
        });
      },
      error: this.httpService.openSnackBarOnErrors.bind(this.httpService),
    });
  }
}
