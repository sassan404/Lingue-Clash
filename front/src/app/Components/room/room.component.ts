import {
  Component,
  ComponentRef,
  createComponent,
  ViewContainerRef,
} from '@angular/core';
import { HTTPService } from '../../Services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { CountdownComponent } from '../countdown/countdown.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Player } from '../../../../../common/Interfaces/Player';
import { SentenceBuildingRoundComponent } from '../sentence-building-round/sentence-building-round.component';
import { FireBaseDBService } from '../../Services/firebase-db.service';
import { combineLatest, map } from 'rxjs';

import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatProgressBarModule,
    MatButton,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    SentenceBuildingRoundComponent,
    CountdownComponent,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  roomId?: string;
  playerUsername?: string;

  countDown = 0;
  roundNumber = 0;
  countDownContainer: ViewContainerRef | undefined;
  private countDownComponentRef: ComponentRef<CountdownComponent> | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HTTPService,
    public firebaseDBService: FireBaseDBService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.roomId = params['roomId'];
      this.playerUsername = params['playerUsername'];
    });
  }

  ngOnInit() {
    if (this.roomId && this.playerUsername) {
      this.firebaseDBService.roomId.next(this.roomId);
      this.firebaseDBService.playerUserName.next(this.playerUsername);
    } else this.router.navigate(['/']);

    this.firebaseDBService.countDownSubject.subscribe((countDown) => {
      this.countDown = countDown;
    });

    this.firebaseDBService.roundNumberSubject.subscribe((roundNumber) => {
      this.roundNumber = roundNumber;
    });
  }

  ngOnDestroy() {}

  declarePlayerReady() {
    // Call cloud function to start rounds and update the currentRound in the room
    // This is a placeholder for the actual implementation
    if (this.roomId && this.playerUsername)
      this.httpService.setPlayerReady(this.roomId, this.playerUsername);
  }

  showReadyButton = combineLatest([
    this.firebaseDBService.playerSubject,
    this.firebaseDBService.allPlayersSubject,
    this.firebaseDBService.roundSubject,
  ]).pipe(
    map(([player, players, round]) => {
      return player.canReady(this.getPlayersArray(players).length, round.state);
    }),
  );

  showPlayerIsWaiting = combineLatest([
    this.firebaseDBService.playerSubject,
    this.firebaseDBService.roundSubject,
  ]).pipe(
    map(([player, round]) => {
      return player.isWaiting(round.state);
    }),
  );

  getPlayersArray(players: { [playerId: string]: Player }): Player[] {
    return Object.values(players);
  }

  // Dynamically create the CountdownComponent
  async createCountdownComponent() {
    const applicationRef = await bootstrapApplication(RoomComponent);
    // Locate a DOM node that would be used as a host.
    const hostElement = document.getElementById('hello-component-host');
    // Get an `EnvironmentInjector` instance from the `ApplicationRef`.
    const environmentInjector = applicationRef.injector;
    // We can now create a `ComponentRef` instance.
    if (hostElement) {
      this.countDownComponentRef = createComponent(CountdownComponent, {
        hostElement,
        environmentInjector,
      });
    }
  }

  // Destroy the CountdownComponent
  destroyCountdownComponent() {
    if (this.countDownComponentRef) {
      this.countDownComponentRef.destroy();
    }
  }
}
