import { trigger, transition, style, animate } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { HTTPService } from '../../Services/http.service';
import { Subject } from 'rxjs';
import { Unsubscribe } from 'firebase/database';
import { RoundStates } from '../../../../../common/Interfaces/Interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.css',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('500ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CountdownComponent implements OnInit {
  countdown: number = 5;
  message: string = '';
  interval: any;

  @Input() roomId: string = '';
  @Input() roundNumber: number = 0;

  roundNumberSubject = new Subject<number>();
  stateSubject = new Subject<RoundStates>();

  listenToCountdownSubscription: Unsubscribe | undefined;
  listenToStateSubscription: Unsubscribe | undefined;

  constructor(private httpService: HTTPService) {}
  ngOnInit(): void {
    this.listenToCountdownSubscription = this.httpService.listenToCountdown(
      this.roomId,
      this.roundNumber,
      this.roundNumberSubject,
    );
    this.listenToStateSubscription = this.httpService.listenToState(
      this.roomId,
      this.roundNumber,
      this.stateSubject,
    );
  }

  startCountdown() {
    this.interval = setInterval(() => {
      if (this.countdown > 1) {
        this.countdown--;
      } else if (this.countdown === 1) {
        this.message = 'Ready!';
        clearInterval(this.interval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    // Unsubscribe from Firebase observables when the component is destroyed
    if (this.listenToCountdownSubscription) {
      this.listenToCountdownSubscription();
    }
    if (this.listenToStateSubscription) {
      this.listenToStateSubscription();
    }
  }
}
