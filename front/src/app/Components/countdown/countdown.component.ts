import { trigger, transition, style, animate } from '@angular/animations';
import { Component, Input, numberAttribute } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RoundStates } from '../../../../../common/Interfaces/enums';
import { FireBaseDBService } from '../../Services/firebase-db.service';

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
export class CountdownComponent {

  @Input({transform: numberAttribute}) countDown = 0;
  constructor() {}

  ngOnChanges(){
    console.log('countDown', this.countDown);
  }

}
