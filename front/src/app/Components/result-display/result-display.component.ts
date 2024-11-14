import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FireBaseDBService } from '../../Services/firebase-db.service';
import { MatSortModule } from '@angular/material/sort';
import {
  SentenceEvaluationReply,
  SentenceEvaluationReplyKeys,
} from '@common/Interfaces/TreatedChatGPTStructure';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-result-display',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './result-display.component.html',
  styleUrl: './result-display.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
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
  displayedWithExpand: string[] = [...this.displayedColumns, 'expand'];
  expandedElement: string = '';

  innerColumns = [
    { name: 'Player', key: 'player' },
    {name: 'Language', key: 'language'},
    { name: 'Sentence', key: 'sentence' },
    { name: 'Missing words', key: 'missingWords' },
    { name: 'Spelling mistakes', key: 'spellingMistakes' },
    { name: 'Grammar mistakes', key: 'grammarMistakes' },
    { name: 'Coherence mistakes', key: 'coherenceMistakes' },
    { name: 'Score', key: 'score' },
  ];
  displayedInnerColumns = this.innerColumns.map((column) => column.key);
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
      this.displayedWithExpand = [...this.displayedColumns, 'expand'];
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

  getEvaluationProperty(
    column: string,
    evaluation: SentenceEvaluationReply | undefined,
  ) {
    const evaluationProperty =
      evaluation?.[column as SentenceEvaluationReplyKeys];
    if (!evaluationProperty) return 0;
    if (Array.isArray(evaluationProperty)) {
      return evaluationProperty.length;
    }
    return evaluationProperty;
  }

  getEvaluationPropertyTooltip(
    column: string,
    evaluation: SentenceEvaluationReply | undefined,
  ): string | null | undefined {
    const evaluationProperty =
      evaluation?.[column as SentenceEvaluationReplyKeys];
    if (Array.isArray(evaluationProperty)) {
      return evaluationProperty.join('\n');
    } else return null;
  }
}
