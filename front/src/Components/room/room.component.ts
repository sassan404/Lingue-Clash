import { Component, Inject } from '@angular/core';
import { HTTPService, Player } from '../../app/Services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { Unsubscribe } from 'firebase/database';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressBarModule,
    MatButton,
    MatCardModule,
    MatListModule,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  roomId?: string;
  roomCode?: string;
  players: Player[] = [];
  roomSubscription: Unsubscribe = () => {};

  rounds: any[] = [];
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
    this.httpService.roomcode.subscribe((roomCode) => {
      console.log('roomCode', roomCode);
      if (roomCode) this.roomCode = roomCode;
      else {
        this.router.navigate(['/']);
        this.httpService.roomcode.unsubscribe();
        this.httpService.players.unsubscribe();
        this.roomSubscription();
      }
    });
    this.httpService.players.subscribe((players) => {
      this.players = players;
    });
    console.log('roomId', this.roomId);
    if (this.roomId != undefined) {
      this.roomSubscription = this.httpService.getRoomUpdates(this.roomId);
    } else this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.roomSubscription();
  }

  startRounds() {
    // Call cloud function to start rounds and update the currentRound in the room
    // This is a placeholder for the actual implementation
    console.log('Start rounds');
  }

  updateProgress() {
    if (this.currentRound) {
      this.progressValue = (this.currentRound / 10) * 100;
    } else {
      this.progressValue = 0;
    }
  }
}
