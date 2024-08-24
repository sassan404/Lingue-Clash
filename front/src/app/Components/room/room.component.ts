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
  roomCode?: string;
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
    });
  }

  ngOnInit() {
    this.httpService.roomCode.subscribe((roomCode) => {
      console.log('roomCode', roomCode);
      if (roomCode) this.roomCode = roomCode;
      else {
        this.router.navigate(['/']);
        this.httpService.roomCode.unsubscribe();
        this.httpService.players.unsubscribe();
        this.roomSubscription();
      }
    });
    this.httpService.players.subscribe((players) => {
      this.players = players;
    });
    this.httpService.roundNumber.subscribe((roundNumber) => {
      this.currentRound = roundNumber;
      this.updateProgress();
    });
    this.httpService.roomState.subscribe((roomState) => {
      this.roomIsLoading = roomState === RoomStates.LOADING;
    });
    console.log('roomId', this.roomId);
    if (this.roomId != undefined) {
      this.roomSubscription = this.httpService.getRoomUpdates(this.roomId);
    } else this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.roomSubscription();
  }

  declarePlayerReady() {
    // Call cloud function to start rounds and update the currentRound in the room
    // This is a placeholder for the actual implementation
    console.log('Start rounds');
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
}
