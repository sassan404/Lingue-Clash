import { Component } from '@angular/core';
import {
  HTTPService,
  Player,
  PlayerStates,
  RoomStates,
} from '../../Services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Unsubscribe } from 'firebase/database';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressBarModule,
    MatButton,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  roomId?: string;
  playerUsername?: string;
  roomCode?: string;
  currentPlayer?: Player;
  players: Player[] = [];
  roomIsLoading: boolean = true;
  roomSubscription: Unsubscribe = () => {};

  round: any = [];
  currentRound: number | null = null;
  progressValue: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HTTPService,
  ) {
    console.log('room component');
    this.route.queryParams.subscribe((params) => {
      this.roomId = params['roomId'];
      this.playerUsername = params['playerUsername'];
    });
  }

  ngOnInit() {
    this.httpService.roomCodeSubject.subscribe((roomCode) => {
      console.log('roomCode', roomCode);
      if (roomCode) this.roomCode = roomCode;
      else {
        this.router.navigate(['/']);
        this.httpService.roomCodeSubject.unsubscribe();
        this.httpService.playersSubject.unsubscribe();
        this.roomSubscription();
      }
    });
    this.httpService.playersSubject.subscribe((players) => {
      this.players = players;
    });
    this.httpService.playerSubject.subscribe((player) => {
      console.log('player', player);
      this.currentPlayer = player;
    });
    this.httpService.roundNumberSubject.subscribe((roundNumber) => {
      this.currentRound = roundNumber;
      this.updateProgress();
    });
    this.httpService.roomStateSubject.subscribe((roomState) => {
      this.roomIsLoading = roomState === RoomStates.LOADING;
    });
    console.log('roomId', this.roomId);
    if (this.roomId != undefined && this.playerUsername != undefined) {
      this.roomSubscription = this.httpService.getRoomUpdates(
        this.roomId,
        this.playerUsername,
      );
    } else this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.roomSubscription();
  }

  declarePlayerReady() {
    // Call cloud function to start rounds and update the currentRound in the room
    // This is a placeholder for the actual implementation
    if (this.roomId && this.playerUsername)
      this.httpService.setPlayerReady(this.roomId, this.playerUsername);
  }

  isPlayerReady(player: Player) {
    return player.state === PlayerStates.READY;
  }
  updateProgress() {
    if (this.currentRound) {
      this.progressValue = (this.currentRound / 10) * 100;
    } else {
      this.progressValue = 0;
    }
  }

  showReadyButton() {
    return this.currentPlayer?.state === PlayerStates.WAITING;
  }

  canStart() {
    return this.players.length >= 2;
  }
}
