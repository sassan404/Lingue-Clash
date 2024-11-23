import { CommonModule } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Player } from '@common/Interfaces/Player';
import { FireBaseDBService } from 'src/app/Services/firebase-db.service';

@Component({
  selector: 'app-start-game-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatChipsModule,
    CommonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './start-game-dialog.component.html',
  styleUrl: './start-game-dialog.component.css',
})
export class StartGameDialogComponent {
  playerUsername?: string;
  constructor(public firebaseDBService: FireBaseDBService) {}

  getPlayersArray(players: { [playerId: string]: Player }): Player[] {
    return Object.values(players);
  }

  readonly dialogRef = inject(MatDialogRef<StartGameDialogComponent>);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
