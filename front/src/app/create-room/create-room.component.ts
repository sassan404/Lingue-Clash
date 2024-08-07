import { CommonModule } from '@angular/common';
import { Component, Injectable, signal } from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HTTPService, CreateRequest, JoinRoomResponse } from '../http.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import ISO6391 from 'iso-639-1';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
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
  ],
  templateUrl: './create-room.component.html',
  styleUrl: './create-room.component.css',
})
@Injectable({ providedIn: 'root' })
export class CreateRoomComponent {
  languages: string[] = [];

  filteredLanguages: Observable<string[]>;

  errorMessage = signal('');

  createRoomForm = new FormGroup({
    username: new FormControl('', Validators.required),
    language: new FormControl('', [Validators.required, this.valideLanguage()]),
  });

  constructor(
    private httpService: HTTPService,
    private router: Router,
  ) {
    this.languages = ISO6391.getAllNames();
    merge(
      this.createRoomForm.controls.language.statusChanges,
      this.createRoomForm.controls.language.valueChanges,
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());

    this.filteredLanguages =
      this.createRoomForm.controls.language.valueChanges.pipe(
        startWith(''),
        map((value) => {
          return this.filterLanguages(value);
        }),
      );
  }

  private filterLanguages(value: string | null): string[] {
    const filterValue = value?.toLowerCase();
    return this.languages.filter((language) =>
      language.toLowerCase().includes(filterValue ? filterValue : ''),
    );
  }

  createRoom() {
    const createRequest: CreateRequest = {
      username: this.createRoomForm.value.username || '',
      language: this.createRoomForm.value.language || '',
    };
    this.httpService.createRoom(createRequest).subscribe((reply) => {
      const typedReply = reply as JoinRoomResponse;
      this.router.navigate(['/room'], {
        queryParams: { roomId: typedReply.roomId },
      });
    });
  }

  valideLanguage(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const allowed = this.languages.includes(control.value);
      return allowed ? null : { forbiddenName: { value: control.value } };
    };
  }

  updateErrorMessage() {
    if (this.createRoomForm.controls.language.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (
      this.createRoomForm.controls.language.hasError('forbiddenName')
    ) {
      this.errorMessage.set('Invalid language');
    } else {
      this.errorMessage.set('');
    }
  }
}
