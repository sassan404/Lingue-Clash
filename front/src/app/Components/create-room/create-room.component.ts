import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injectable } from '@angular/core';

import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
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

import { MatCheckboxModule } from '@angular/material/checkbox';

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
  ],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Injectable({ providedIn: 'root' })
export class CreateRoomComponent {
  createRoomForm = new FormGroup(
    {
      username: new FormControl(''),
      language: new FormControl(''),
      adminMode: new FormControl(false),
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
      const adminMode = control.get('adminMode')?.value;
      const allowed = (adminMode || username) && languageValid;
      return allowed ? null : { forbiddenName: { value: control.value } };
    };
  }

  createRoom() {
    const createRequest: CreateRoomRequest = {
      username: this.createRoomForm.value.username || '',
      language: this.createRoomForm.value.language || '',
    };
    this.httpService.createRoom(createRequest).subscribe((reply) => {
      const typedReply = reply as JoinRoomResponse;
      this.router.navigate(['/room'], {
        queryParams: {
          roomId: typedReply.roomId,
          playerUsername: createRequest.username,
        },
      });
    });
  }

  toggleUserNameForm(event: boolean) {
    if (event) {
      this.createRoomForm.get('username')?.reset();
      this.createRoomForm.get('username')?.disable();
    } else {
      this.createRoomForm.get('username')?.enable();
    }
  }
}
