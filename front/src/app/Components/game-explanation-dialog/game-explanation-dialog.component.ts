import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-game-explanation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './game-explanation-dialog.component.html',
  styleUrl: './game-explanation-dialog.component.css',
})
export class GameExplanationDialogComponent {}
