import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { GameExplanationDialogComponent } from '../game-explanation-dialog/game-explanation-dialog.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly dialog = inject(MatDialog);

  constructor(private router: Router) {}

  navigateToCreateRoom() {
    this.router.navigate(['/create-room']);
  }

  navigateToJoinRoom() {
    this.router.navigate(['/join-room']);
  }

  openDialog() {
    this.dialog.open(GameExplanationDialogComponent);
  }
}
