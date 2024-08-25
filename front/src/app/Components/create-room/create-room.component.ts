import { CommonModule } from '@angular/common';
import { Component, Injectable } from '@angular/core';

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
} from '../../Services/http.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
@Component({
  selector: 'app-create-room',
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
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css',
})
@Injectable({ providedIn: 'root' })
export class CreateRoomComponent {
  createRoomForm = new FormGroup({
    username: new FormControl('', Validators.required),
    language: new FormControl(''),
  });

  constructor(
    private httpService: HTTPService,
    private router: Router,
  ) {}

  createRoom() {
    const createRequest: CreateRequest = {
      username: this.createRoomForm.value.username || '',
      language: this.createRoomForm.value.language || '',
    };
    this.httpService.createRoom(createRequest).subscribe((reply) => {
      const typedReply = reply as JoinRoomResponse;
      console.log('typedReply', typedReply);
      this.router.navigate(['/room'], {
        queryParams: { roomId: typedReply.roomId, playerUsername: createRequest.username },
      });
    });
  }
}
