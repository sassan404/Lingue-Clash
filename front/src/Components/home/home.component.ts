import { Component } from '@angular/core';

import { Router } from '@angular/router';
;
import { MatButtonModule } from '@angular/material/button';
import { JoinRoomComponent } from '../join-room/join-room.component';
import { CreateRoomComponent } from '../create-room/create-room.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [JoinRoomComponent, CreateRoomComponent, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToCreateRoom() {
    this.router.navigate(['/create-room']);
  }

  navigateToJoinRoom() {
    this.router.navigate(['/join-room']);
  }
}
