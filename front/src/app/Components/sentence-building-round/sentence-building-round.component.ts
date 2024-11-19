import { CommonModule } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { GivenWord } from '@common/Interfaces/GivenWord';
import { PlayerStates, RoundStates } from '@common/Interfaces/enums';
import { HTTPService } from '../../Services/http.service';
import { RoundHelpers } from '@common/Interfaces/Round/RoundHelpers';
import { FireBaseDBService } from '../../Services/firebase-db.service';
import { combineLatest, map } from 'rxjs';
import { Player } from '@common/Interfaces/Player';
import { SentenceBuildingRound } from '@common/Interfaces/Round/SentenceBuildingRound';

@Component({
  selector: 'app-sentence-building-round',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatProgressBarModule,
    MatButton,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sentence-building-round.component.html',
  styleUrl: './sentence-building-round.component.css',
})
export class SentenceBuildingRoundComponent {
  answer = new FormControl('', Validators.required);

  roomId!: string;
  currentPlayer?: Player;
  sentenceBuildingRound!: SentenceBuildingRound | undefined;

  constructor(
    private httpService: HTTPService,
    public firebaseDBService: FireBaseDBService,
  ) {}

  ngOnInit() {
    this.firebaseDBService.roomId.subscribe((roomId) => {
      this.roomId = roomId;
    });
    this.firebaseDBService.playerSubject.subscribe((currentPlayer) => {
      this.currentPlayer = currentPlayer;
    });
    this.firebaseDBService.roundSubject.subscribe((currentRound) => {
      {
        this.sentenceBuildingRound =
          RoundHelpers.getSentenceBuildingRound(currentRound);

        if (
          this.sentenceBuildingRound &&
          this.sentenceBuildingRound.givenWords
        ) {
          const givenWords: GivenWord[] = Array.isArray(
            this.sentenceBuildingRound.givenWords,
          )
            ? this.sentenceBuildingRound.givenWords
            : [this.sentenceBuildingRound.givenWords];
          this.sentenceBuildingRound.playerWords = givenWords?.flatMap(
            (givenWord: GivenWord) => {
              const wordForPlayer: string[] = [
                givenWord[this.currentPlayer?.language ?? 'English'],
              ];
              return wordForPlayer;
            },
          );
        }
      }
    });
  }

  showPlayerIsWaiting(): boolean {
    if (this.currentPlayer && this.sentenceBuildingRound)
      return this.currentPlayer.isWaiting(this.sentenceBuildingRound.state);
    return false;
  }

  showSubmitButton() {
    return (
      this.sentenceBuildingRound?.state === RoundStates.PLAYING &&
      this.currentPlayer?.state === PlayerStates.PLAYING
    );
  }

  showRoundIfNoPlayer() {
    return (
      !this.currentPlayer &&
      this.sentenceBuildingRound?.state === RoundStates.PLAYING
    );
  }

  submitRoundAnswer(roomId: string, playerUserName: string) {
    if (this.firebaseDBService.roomId && this.answer.value)
      this.httpService.submitPlayerAnswer(
        roomId,
        playerUserName,
        this.answer.value,
      );

    this.answer.reset();
  }
}
