import {
  Component,
  ComponentRef,
  createComponent,
  ViewContainerRef,
} from '@angular/core';
import { HTTPService } from '../../Services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Unsubscribe } from 'firebase/database';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import {
  Player,
  PlayerStates,
  RoomStates,
  RoundContainer,
  RoundStates,
} from '../../../../../common/Interfaces/Interfaces';
import { CountdownComponent } from '../countdown/countdown.component';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressBarModule,
    MatButton,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent {
  roomId?: string;
  playerUsername?: string;
  roomCode?: string;
  currentPlayer?: Player;
  players: Player[] = [];
  roomIsLoading: boolean = true;
  roomSubscription: Unsubscribe = () => {};

  currentRound!: RoundContainer;

  countdownContainer!: ViewContainerRef;

  round: any = [];
  currentRoundNumber!: number;
  progressValue: number = 0;

  private countdownComponentRef!: ComponentRef<CountdownComponent>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HTTPService,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.roomId = params['roomId'];
      this.playerUsername = params['playerUsername'];
    });
  }

  ngOnInit() {
    this.httpService.roomCodeSubject.subscribe((roomCode) => {
      console.log('roomCode: ', roomCode);
      if (roomCode) {
        this.roomCode = roomCode;
      } else {
        this.router.navigate(['/']);
        this.httpService.roomCodeSubject.unsubscribe();
        this.httpService.playersSubject.unsubscribe();
        this.httpService.roundNumberSubject.unsubscribe();
        this.httpService.roomStateSubject.unsubscribe();
        this.roomSubscription();
      }
    });
    this.httpService.playersSubject.subscribe((players) => {
      this.players = players;
    });
    this.httpService.playerSubject.subscribe((player) => {
      console.log('player', player);
      this.currentPlayer = player;
    });

    this.httpService.roomStateSubject.subscribe((roomState) => {
      this.roomIsLoading = roomState === RoomStates.LOADING;
    });
    this.httpService.roundNumberSubject.subscribe((roundNumber) => {
      this.currentRoundNumber = roundNumber;
      this.updateProgress();
    });
    this.httpService.roundSubject.subscribe((round) => {
      console.log('round', round);
      this.currentRound = round;
      // if (round.state === RoundStates.STARTING) {
      //   this.createCountdownComponent();
      // } else if (this.countdownComponentRef) {
      //   this.destroyCountdownComponent();
      // }
    });
    if (this.roomId != undefined && this.playerUsername != undefined) {
      this.roomSubscription = this.httpService.getRoomUpdates(
        this.roomId,
        this.playerUsername,
      );
    } else this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.roomSubscription();
  }

  declarePlayerReady() {
    // Call cloud function to start rounds and update the currentRound in the room
    // This is a placeholder for the actual implementation
    if (this.roomId && this.playerUsername)
      this.httpService.setPlayerReady(this.roomId, this.playerUsername);
  }

  submitRoundAnswer() {}

  isPlayerReady(player: Player) {
    return player.state === PlayerStates.READY;
  }

  showReadyButton() {
    return this.currentPlayer?.state === PlayerStates.WAITING;
  }

  showSubmitButton() {
    return this.currentRound?.state === RoundStates.PLAYING;
  }

  canStart() {
    return this.players.length >= 2;
  }

  updateProgress() {
    if (this.currentRoundNumber) {
      this.progressValue = (this.currentRoundNumber / 10) * 100;
    } else {
      this.progressValue = 0;
    }
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
      this.countdownComponentRef = createComponent(CountdownComponent, {
        hostElement,
        environmentInjector,
      });
    }
  }

  // Destroy the CountdownComponent
  destroyCountdownComponent() {
    if (this.countdownComponentRef) {
      this.countdownComponentRef.destroy();
    }
  }
}
