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
import { RoundContainer } from '../../../../../common/Interfaces/Round/Round';
import { Player } from '../../../../../common/Interfaces/Player';
import { GivenWord } from '../../../../../common/Interfaces/GivenWord';
import {
  PlayerStates,
  RoundStates,
} from '../../../../../common/Interfaces/enums';
import { HTTPService } from '../../Services/http.service';
import { SentenceBuildingRound } from '../../../../../common/Interfaces/Round/SentenceBuildingRound';
import { RoundHelpers } from '../../../../../common/Interfaces/Round/RoundHelpers';

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
  @Input({ required: true }) currentRound!: RoundContainer;
  @Input({ required: true }) currentPlayer!: Player;
  @Input() roomId?: string;

  sentenceBuildingRound: SentenceBuildingRound | undefined;
  answer = new FormControl('', Validators.required);

  constructor(private httpService: HTTPService) {}
  ngOnChanges(): void {
    if (this.currentRound && this.currentPlayer) {
      this.sentenceBuildingRound = RoundHelpers.getSentenceBuildingRound(
        this.currentRound,
      );

      if (this.sentenceBuildingRound) {
        const givenWords: GivenWord[] = Array.isArray(
          this.sentenceBuildingRound.givenWords,
        )
          ? this.sentenceBuildingRound.givenWords
          : [this.sentenceBuildingRound.givenWords];
        this.sentenceBuildingRound.playerWords = givenWords?.flatMap(
          (givenWord: GivenWord) => {
            const wordForPlayer: string[] = this.currentPlayer
              ? [givenWord[this.currentPlayer.language]]
              : [];
            return wordForPlayer;
          },
        );
      }
    }
  }

  showSubmitButton() {
    return (
      this.currentRound?.state === RoundStates.PLAYING &&
      this.currentPlayer?.state === PlayerStates.PLAYING
    );
  }

  submitRoundAnswer() {
    if (this.roomId && this.currentPlayer && this.answer.value)
      this.httpService.submitPlayerAnswer(
        this.roomId,
        this.currentPlayer.username,
        this.answer.value,
      );
  }
}
