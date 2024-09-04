import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { RoomComponent } from './Components/room/room.component';
import { CreateRoomComponent } from './Components/create-room/create-room.component';
import { JoinRoomComponent } from './Components/join-room/join-room.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HomeComponent,
    CreateRoomComponent,
    JoinRoomComponent,
    RoomComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'front';
  content = process.env["API_KEY"] || 'DEF_A';
}
