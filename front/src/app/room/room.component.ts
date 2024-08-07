import { Component, Inject } from '@angular/core';
import { HTTPService, Player } from '../http.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { Unsubscribe } from 'firebase/database';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  roomId?: string;
  roomCode?: string;
  players: Player[] = [];
  roomSubscription: Unsubscribe = () => {};

  constructor(private route: ActivatedRoute, private httpService: HTTPService) {
    this.route.queryParams.subscribe((params) => {
      this.roomId = params['roomId'];
    });
  }

  ngOnInit() {
    this.httpService.roomcode.subscribe((roomCode) => {
      this.roomCode = roomCode;
    });
    this.httpService.players.subscribe((players) => {
      this.players = players;
    });
    if (this.roomId != undefined) {
      this.roomSubscription = this.httpService.getRoomUpdates(this.roomId);
    }
  }

  ngOnDestroy() {
    this.httpService.roomcode.unsubscribe();
    this.httpService.players.unsubscribe();
    this.roomSubscription();
  }
}
