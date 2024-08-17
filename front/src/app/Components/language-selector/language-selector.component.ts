import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  Output,
  signal,
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

import ISO6391 from 'iso-639-1';

@Component({
  selector: 'app-language-selector',
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
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
})
export class LanguageSelectorComponent {
  filteredLanguages: Observable<string[]> = new Observable<string[]>();

  languages: string[];

  @Input() language: FormControl = new FormControl('', []);

  errorMessage = signal('');

  constructor() {
    this.languages = ISO6391.getAllNames();
    merge(this.language.statusChanges, this.language.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.updateErrorMessage();
      });
  }

  ngOnInit() {
    this.language.addValidators(this.valideLanguage());
    this.language.addValidators(Validators.required);

    this.filteredLanguages = this.language.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filterValue = value?.toLowerCase();
        console.log(filterValue);
        return this.languages.filter((language) =>
          language.toLowerCase().includes(filterValue ? filterValue : ''),
        );
      }),
    );
  }


  @Output() valideLanguage(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const allowed = this.languages.includes(control.value);
      return allowed ? null : { forbiddenName: { value: control.value } };
    };
  }

  updateErrorMessage() {
    if (this.language.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.language.hasError('forbiddenName')) {
      this.errorMessage.set('Invalid language');
    } else {
      this.errorMessage.set('');
    }
  }
}
