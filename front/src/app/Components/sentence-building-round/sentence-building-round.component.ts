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

  constructor(
    private httpService: HTTPService,
    public firebaseDBService: FireBaseDBService,
  ) {}

  sentenceBuildingRoundObervable = combineLatest([
    this.firebaseDBService.roomId,
    this.firebaseDBService.playerSubject,
    this.firebaseDBService.roundSubject,
  ]).pipe(
    map(([roomId, currentPlayer, currentRound]) => {
      const sentenceBuildingRound =
        RoundHelpers.getSentenceBuildingRound(currentRound);

      if (sentenceBuildingRound && sentenceBuildingRound.givenWords) {
        const givenWords: GivenWord[] = Array.isArray(
          sentenceBuildingRound.givenWords,
        )
          ? sentenceBuildingRound.givenWords
          : [sentenceBuildingRound.givenWords];
        sentenceBuildingRound.playerWords = givenWords?.flatMap(
          (givenWord: GivenWord) => {
            const wordForPlayer: string[] = [givenWord[currentPlayer.language]];
            return wordForPlayer;
          },
        );
      }
      return {
        roomId,
        currentPlayer,
        currentRound,
        sentenceBuildingRound,
        showPlayerIsWaiting: currentPlayer.isWaiting(currentRound.state),
      };
    }),
  );

  showSubmitButton(roundState: RoundStates, playerState: PlayerStates) {
    return (
      roundState === RoundStates.PLAYING && playerState === PlayerStates.PLAYING
    );
  }

  submitRoundAnswer(roomId: string, playerUserName: string) {
    if (this.firebaseDBService.roomId && this.answer.value)
      this.httpService.submitPlayerAnswer(
        roomId,
        playerUserName,
        this.answer.value,
      );
  }
}
