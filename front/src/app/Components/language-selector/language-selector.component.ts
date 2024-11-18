import { CommonModule } from '@angular/common';
import { Component, Input, Output, signal } from '@angular/core';

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

import ISO6391 from 'iso-639-1';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';

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
    MatChipsModule,
  ],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
})
export class LanguageSelectorComponent {
  // Manually sorted list of languages by popularity
  popularLanguages: string[] = [
    // replace these names by their native names
    'English',
    '中文',
    'हिन्दी',
    'Español',
    'Français',
    'العربية',
    '日本語',
    'Русский',
  ];

  filteredLanguages: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(
    this.popularLanguages,
  );

  languages: string[];
  selectedLanguage: string | null = null;

  @Input() language: FormControl = new FormControl('', []);

  errorMessage = signal('');

  constructor() {
    this.languages = ISO6391.getAllNativeNames();
    merge(this.language.statusChanges, this.language.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.updateErrorMessage();
      });
  }

  ngOnInit() {
    this.language.addValidators(this.valideLanguage());
    this.language.addValidators(Validators.required);
  }

  filterLanguages(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const filterValue = inputElement.value?.toLowerCase();
    if (!filterValue) {
      this.filteredLanguages.next(this.popularLanguages);
      return;
    }
    this.filteredLanguages.next(
      this.languages
        .filter((language) =>
          language.toLowerCase().includes(filterValue ? filterValue : ''),
        )
        .slice(0, 8), // Limit to 8 languages
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
      this.errorMessage.set('Pick your language before continuing');
    } else if (this.language.hasError('forbiddenName')) {
      this.errorMessage.set('Invalid language');
    } else {
      this.errorMessage.set('');
    }
  }

  addLanguage(event: any): void {
    const value = (event.value || '').trim();
    if (value && this.languages.includes(value)) {
      this.selectedLanguage = value;
    }
    event.input.value = '';
    this.language.setValue('');
  }

  removeLanguage(): void {
    this.selectedLanguage = null;
  }

  selectLanguage(event: MatChipListboxChange) {
    this.language.setValue(event.value);
  }
}
