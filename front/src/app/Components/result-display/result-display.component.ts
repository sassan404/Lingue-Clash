import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FireBaseDBService } from '../../Services/firebase-db.service';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-result-display',
  standalone: true,
  imports: [MatTableModule, MatSortModule],
  templateUrl: './result-display.component.html',
  styleUrl: './result-display.component.css',
})
export class ResultDisplayComponent {
  constructor(public firebaseDBService: FireBaseDBService) {}
  totalResults: { [playerId: string]: number } = {};

  rounds: string[] = [];
  scoresByRound: {
    [roundId: string]: {
      [playerId: string]: number;
    };
  } = {};

  playersId: string[] = [];

  defaultDisplayedColumns: string[] = ['player', 'total'];
  displayedColumns: string[] = ['player', 'total'];
  ngOnInit() {
    this.firebaseDBService.totalScoresSubject.subscribe((results) => {
      this.totalResults = results;
    });
    this.firebaseDBService.scoresByRoundSubject.subscribe((scoresByRound) => {
      if (scoresByRound) {
        this.rounds = Object.keys(scoresByRound);
        this.scoresByRound = scoresByRound;
        this.displayedColumns = [
          ...this.defaultDisplayedColumns,
          ...this.rounds,
        ];
      }
    });
    this.firebaseDBService.allPlayersSubject.subscribe((players) => {
      this.playersId = Object.keys(players);
    });
  }
}
