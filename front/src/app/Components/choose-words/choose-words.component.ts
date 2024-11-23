import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GivenWords } from '@common/Interfaces/GivenWord';
import { HTTPService } from 'src/app/Services/http.service';

import { ErrorStateMatcher } from '@angular/material/core';
import { FireBaseDBService } from 'src/app/Services/firebase-db.service';

import { SPACE, ENTER } from '@angular/cdk/keycodes';
import { MatDialog } from '@angular/material/dialog';
import { StartGameDialogComponent } from '../start-game-dialog/start-game-dialog.component';

@Component({
  selector: 'app-choose-words',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './choose-words.component.html',
  styleUrl: './choose-words.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseWordsComponent {
  readonly separatorKeysCodes: number[] = [ENTER, SPACE];
  roomId!: string;

  mainLanguage!: string;

  readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.firebaseDBService.roomId.subscribe((roomId) => {
      this.roomId = roomId;
    });
    this.firebaseDBService.mainLanguageSubject.subscribe((mainLanguage) => {
      this.mainLanguage = mainLanguage;
    });
  }
  readonly wordsToUse: WritableSignal<string[]> = signal([]);

  readonly wordsToUseControl = new FormControl(this.wordsToUse());
  readonly numberOfRounds = new FormControl(5, [Validators.required]);
  readonly numberOfWords = new FormControl(6, [Validators.required]);

  updateRoomPropertiesForm = new FormGroup(
    {
      wordsInput: this.wordsToUseControl,
      numberOfRounds: this.numberOfRounds,
      numberOfWords: this.numberOfWords,
    },
    { validators: [this.customValidator()] },
  );

  constructor(
    private httpService: HTTPService,
    private firebaseDBService: FireBaseDBService,
  ) {}
  announcer = inject(LiveAnnouncer);

  matcher = new MyErrorStateMatcher(this.updateRoomPropertiesForm);

  customValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const numberOfRounds: number =
        Number(control.get('numberOfRounds')?.value) ?? 0;
      const numberOfWords: number =
        Number(control.get('numberOfWords')?.value) ?? 0;
      const wordsToUse: string[] = control.get('wordsInput')?.value;
      const roundsMoreThanWords: boolean = numberOfRounds < numberOfWords;
      const remainingWords = numberOfWords - wordsToUse.length;
      const errors: { [name: string]: any } = {};
      if (numberOfWords == 0) {
        errors['zeroWordsNumber'] = { value: control.value };
      }
      if (numberOfRounds == 0) {
        errors['zeroRoundsNumber'] = { value: control.value };
      }
      if (!roundsMoreThanWords) {
        errors['wordsLessThanRounds'] = { value: control.value };
      }
      if (remainingWords > 0) {
        errors['notEnoughWords'] = { value: remainingWords };
      }
      return errors;
    };
  }

  removeWord(keyword: string) {
    this.wordsToUse.update((keywords) => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword} from reactive form`);
      this.wordsToUseControl.setValue(keywords);
      return [...keywords];
    });
  }

  addWord(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our keyword
    if (value) {
      this.wordsToUse.update((keywords) => {
        const words = [...keywords, value.toLowerCase()];
        this.wordsToUseControl.setValue(words);
        return words;
      });
      this.announcer.announce(`added ${value} to reactive form`);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  edit(word: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove word if it no longer has a name
    if (!value) {
      this.removeWord(word);
      return;
    }

    // Edit existing word
    this.wordsToUse.update((words) => {
      const index = words.indexOf(word);
      if (index >= 0) {
        words[index] = value.toLowerCase();
        return [...words];
      }
      return words;
    });
  }

  clickEvent(event: MouseEvent) {
    const neededNumber =
      (this.numberOfWords.value ?? 0) - this.wordsToUse().length;
    this.httpService
      .getWordSuggestion(neededNumber + 4, this.mainLanguage)
      .subscribe({
        next: (response) => {
          const typedReply = response as GivenWords;
          this.wordsToUse.update((keywords) => [
            ...keywords,
            ...typedReply.words
              .map((word) => word[this.mainLanguage].toLowerCase())
              .filter((word) => !keywords.includes(word))
              .splice(0, neededNumber),
          ]);
          this.wordsToUseControl.setValue(this.wordsToUse());
        },
        error: this.httpService.openSnackBarOnErrors.bind(this.httpService),
      });
    event.stopPropagation();
  }

  enoughNumberOfWords(): boolean {
    return (this.numberOfWords.value ?? 0) - this.wordsToUse().length === 0;
  }

  StartGame() {
    if (this.updateRoomPropertiesForm.valid) {
      const dialogRef = this.dialog.open(StartGameDialogComponent);

      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed');
        if (result !== undefined) {
          if (this.numberOfRounds.value && this.numberOfWords.value)
            this.httpService.updateGameProperties(
              this.numberOfRounds.value,
              this.numberOfWords.value,
              this.wordsToUse(),
              this.roomId,
            );
        }
      });
    }
  }
}
/** Error when invalid control is dirty, touched, or submitted. */
class MyErrorStateMatcher implements ErrorStateMatcher {
  public constructor(private formGroup?: FormGroup) {}
  isErrorState(
    control: FormGroup | null,
    formGroup: FormGroupDirective | NgForm | null,
  ): boolean {
    let parentFormGroup = this.formGroup ?? formGroup;
    return (
      !!(parentFormGroup?.dirty || parentFormGroup?.touched) &&
      !!parentFormGroup?.invalid
    );
  }
}
