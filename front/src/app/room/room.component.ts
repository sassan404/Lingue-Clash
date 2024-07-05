import { Component, Inject } from '@angular/core';
import { HTTPService } from '../http.service';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent {

  constructor(@Inject('roomCode') roomCode: string, private httpService: HTTPService ) {
    this.roomCode = roomCode;
   }
roomCode: string;
players: string[] = [];

  ngOnInit() {
    this.httpService.getPlayerUpdates().subscribe(value =>  value);
  }

}
