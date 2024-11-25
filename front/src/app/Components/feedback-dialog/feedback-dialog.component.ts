import { Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './feedback-dialog.component.html',
  styleUrl: './feedback-dialog.component.css',
})
export class FeedbackDialogComponent {
  readonly dialogRef = inject(MatDialogRef<FeedbackDialogComponent>);
  readonly message = model('');

  onNoClick(): void {
    this.dialogRef.close();
  }
}
