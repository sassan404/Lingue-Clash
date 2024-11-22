import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';

import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HTTPService } from '../../Services/http.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { CreateRoomRequest } from '@common/Interfaces/Requests';
import { JoinRoomResponse } from '@common/Interfaces/Responses';

import {
  MatButtonToggleChange,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    LanguageSelectorComponent,
    MatCheckboxModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Injectable({ providedIn: 'root' })
export class CreateRoomComponent {
  createRoomForm = new FormGroup(
    {
      username: new FormControl(),
      language: new FormControl(),
      gameMode: new FormControl(),
    },
    { validators: [this.customValidator()] },
  );

  constructor(
    private httpService: HTTPService,
    private router: Router,
  ) {}

  customValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const username = control.get('username')?.value;
      const languageValid = control.get('language')?.valid;
      const gameMode = control.get('gameMode')?.value;
      const allowed =
        gameMode && (gameMode === 'admin' || username) && languageValid;
      return allowed ? null : { forbiddenName: { value: control.value } };
    };
  }

  createRoom() {
    const createRequest: CreateRoomRequest = {
      username: this.createRoomForm.value.username || '',
      language: this.createRoomForm.value.language || '',
      mode: this.createRoomForm.value.gameMode || '',
    };
    this.httpService.createRoom(createRequest).subscribe({
      next: (reply) => {
        const typedReply = reply as JoinRoomResponse;
        this.router.navigate(['/room'], {
          queryParams: {
            roomId: typedReply.roomId,
            playerUsername: createRequest.username,
          },
        });
      },
      error: this.httpService.openSnackBarOnErrors.bind(this.httpService),
    });
  }

  toggleUserNameForm(event: MatButtonToggleChange) {
    if (event.value === 'admin') {
      this.createRoomForm.get('username')?.reset();
      this.createRoomForm.get('username')?.disable();
    } else {
      this.createRoomForm.get('username')?.enable();
    }
  }
}
