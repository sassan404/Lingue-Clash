import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FireBaseDBService } from 'src/app/Services/firebase-db.service';
import { MatCardModule } from '@angular/material/card';
import { HTTPService } from 'src/app/Services/http.service';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';

export interface DialogData {
  playerId?: string;
  roomId?: string;
  message: string;
}

@Component({
  selector: 'app-communicate-feedback',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './communicate-feedback.component.html',
  styleUrl: './communicate-feedback.component.css',
})
export class CommunicateFeedbackComponent {
  readonly dialog = inject(MatDialog);
  roomId?: string;
  playerId?: string;

  constructor(
    private firebaseService: FireBaseDBService,
    private httpService: HTTPService,
  ) {}

  ngOnInit() {
    this.firebaseService.roomId.subscribe((roomId) => {
      this.roomId = roomId;
    });
    this.firebaseService.playerUserName.subscribe((playerId) => {
      this.playerId = playerId;
    });
  }
  openDialog(): void {
    const buttonElement = document.activeElement as HTMLElement; // Get the currently focused element
    buttonElement.blur(); // Remove focus from the button
    const dialogRef = this.dialog.open(FeedbackDialogComponent, {
      width: '50%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.httpService.sendFeedback(this.roomId, this.playerId, result);
      }
    });
  }
}
