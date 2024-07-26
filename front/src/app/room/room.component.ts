import { Component, Inject } from '@angular/core';
import { HTTPService } from '../http.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent {
  roomCode?: string;
  players: string[] = [];
  
  constructor(private route: ActivatedRoute, private httpService: HTTPService ) {
    this.route.queryParams.subscribe(params => {
      this.roomCode = params['roomCode'];
    });
   }

  ngOnInit() {
    // this.httpService.getPlayerUpdates().subscribe(value =>  value);
  }

}
