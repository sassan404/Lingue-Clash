import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FireBaseDBService } from '../../Services/firebase-db.service';
import { MatSortModule } from '@angular/material/sort';
import { SentenceEvaluationReply } from '@common/Interfaces/TreatedChatGPTStructure';

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
      [playerId: string]: SentenceEvaluationReply | undefined;
    };
  } = {};

  playersId: string[] = [];

  defaultDisplayedColumns: string[] = ['Rounds'];
  displayedColumns: string[] = ['Rounds'];

  defaultDisplayRows: string[] = ['player', 'total'];

  ngOnInit() {
    this.firebaseDBService.scoresByRoundSubject.subscribe((scoresByRound) => {
      if (scoresByRound) {
        this.rounds = Object.keys(scoresByRound);
        this.defaultDisplayRows.concat(this.rounds);
        this.scoresByRound = scoresByRound;
        this.calculateTotalScores();
      }
    });
    this.firebaseDBService.allPlayersSubject.subscribe((players) => {
      this.playersId = Object.keys(players);
      this.displayedColumns = [
        ...this.defaultDisplayedColumns,
        ...this.playersId,
      ];
      this.calculateTotalScores();
    });
  }

  calculateTotalScores() {
    this.totalResults = {};
    for (const round of this.rounds) {
      for (const playerId of this.playersId) {
        if (!this.totalResults[playerId]) {
          this.totalResults[playerId] = 0;
        }
        this.totalResults[playerId] +=
          this.scoresByRound[round][playerId]?.score || 0;
      }
    }
  }
}
