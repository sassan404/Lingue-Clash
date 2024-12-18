import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommunicateFeedbackComponent } from './Components/communicate-feedback/communicate-feedback.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommunicateFeedbackComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Lingue clash';

  constructor(private router: Router) {}
  goToHomePage() {
    this.router.navigate(['/']);
  }
}
