import {
  Component,
  ComponentRef,
  createComponent,
  ViewContainerRef,
} from '@angular/core';
import { HTTPService } from '../../Services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Player } from '@common/Interfaces/Player';
import { SentenceBuildingRoundComponent } from '../sentence-building-round/sentence-building-round.component';
import { FireBaseDBService } from '../../Services/firebase-db.service';
import { combineLatest, map } from 'rxjs';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ResultDisplayComponent } from '../result-display/result-display.component';
import { ChooseWordsComponent } from '../choose-words/choose-words.component';
import { GameModes, RoundStates } from '@common/Interfaces/enums';

@Component({
  selector: 'app-room',
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
    MatTooltipModule,
    SentenceBuildingRoundComponent,
    MatCardModule,
    MatTableModule,
    ResultDisplayComponent,
    NgClass,
    ChooseWordsComponent,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  roomId?: string;
  playerUsername?: string;

  maxRound!: number;
  isLocked = false;
  roundNumber = 0;
  createdBy = '';
  roundState = RoundStates.STARTING;
  gameMode!: GameModes;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HTTPService,
    public firebaseDBService: FireBaseDBService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.roomId = params['roomId'];
      this.playerUsername = params['playerUsername'];
    });
  }

  ngOnInit() {
    if (this.roomId) {
      this.firebaseDBService.roomId.next(this.roomId);
      this.firebaseDBService.playerUserName.next(this.playerUsername);
    } else this.router.navigate(['/']);

    this.firebaseDBService.roomLockedSubject.subscribe((isLocked) => {
      this.isLocked = isLocked;
    });

    this.firebaseDBService.roundNumberSubject.subscribe((roundNumber) => {
      this.roundNumber = roundNumber;
    });
    this.firebaseDBService.createdBySubject.subscribe((createdBy) => {
      this.createdBy = createdBy;
    });
    this.firebaseDBService.roundStateSubject.subscribe((roundState) => {
      this.roundState = roundState;
    });
    this.firebaseDBService.gameModeSubject.subscribe((gameMode) => {
      this.gameMode = gameMode;
    });
    this.firebaseDBService.maxRoundSubject.subscribe((maxRound) => {
      this.maxRound = maxRound;
    });
  }

  ngOnDestroy() {}

  declarePlayerReady() {
    // Call cloud function to set the player state to ready
    if (this.roomId && this.playerUsername)
      this.httpService.setPlayerReady(this.roomId, this.playerUsername);
  }

  startNewRound() {
    // Call cloud function to start the next round
    if (this.roomId) this.httpService.startNewRound(this.roomId);
  }

  showReadyButton = combineLatest([
    this.firebaseDBService.playerSubject,
    this.firebaseDBService.allPlayersSubject,
    this.firebaseDBService.roundSubject,
  ]).pipe(
    map(([player, players, round]) => {
      return player?.canReady(
        this.getPlayersArray(players).length,
        round.state,
        this.gameMode,
      );
    }),
  );

  showPlayerIsWaiting = combineLatest([
    this.firebaseDBService.playerSubject,
    this.firebaseDBService.roundSubject,
  ]).pipe(
    map(([player, round]) => {
      return player?.isWaiting(round.state);
    }),
  );

  getPlayersArray(players: { [playerId: string]: Player }): Player[] {
    return Object.values(players);
  }

  showGameProperties() {
    return (
      this.roundNumber == 0 &&
      this.roundState == RoundStates.STARTING &&
      (this.playerUsername?.length === 0 ||
        this.playerUsername === this.createdBy)
    );
  }
}
