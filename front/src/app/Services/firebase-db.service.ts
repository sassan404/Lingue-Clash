import { inject, Injectable } from '@angular/core';
import {
  Database,
  DatabaseReference,
  onValue,
  ref,
} from '@angular/fire/database';
import {
  BehaviorSubject,
  from,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { child } from '@angular/fire/database';
import { Player } from '../../../../common/Interfaces/Player';
import { RoundContainer } from '../../../../common/Interfaces/Round/Round';
import { RoundHelpers } from '../../../../common/Interfaces/Round/RoundHelpers';
import { RoundStates } from '../../../../common/Interfaces/enums';

@Injectable({ providedIn: 'root' })
export class FireBaseDBService {
  constructor() {
    // This service can now make HTTP requests via `this.http`.
  }

  private database = inject(Database);

  roomId = new BehaviorSubject<string>('');
  playerUserName = new BehaviorSubject<string>('');

  private roomRef = this.roomId.pipe(
    map((roomId: string) => ref(this.database, 'rooms/' + roomId)),
  );

  roomCodeSubject = this.listenToRoomChange<string>('roomCode');
  roomLockedSubject = this.listenToRoomChange<boolean>('isLocked');
  progressSubject = this.listenToRoomChange<number>('progress').pipe(
    map((progress) => (progress / 10) * 100),
  );

  roundNumberSubject = this.listenToRoomChange<number>('currentRoundNumber');

  allPlayersSubject = this.listenToRoomChange<{ [playerId: string]: Player }>(
    'players',
  ).pipe(
    map((players) => {
      const keys = Object.keys(players);
      keys.forEach((key) => {
        players[key] = new Player(players[key]);
      });
      return players;
    }),
  );

  playerSubject = this.allPlayersSubject.pipe(
    switchMap((players) => {
      return this.playerUserName.pipe(
        map((userName) => new Player(players[userName])),
      );
    }),
  );

  roundSubject = this.listenToRoomChange<RoundContainer>('currentRound').pipe(
    map((round) => {
      const roundContainer = RoundHelpers.getSentenceBuildingRound(round);
      if (roundContainer) {
        return roundContainer;
      } else return new RoundContainer(round);
    }),
  );

  roundStateSubject = this.roundSubject.pipe(map((round) => round.state));

  countDownSubject = this.listenToRoomChange<number>('countDown');

  listenToRoomChange<T>(parameter: string): Observable<T> {
    return this.roomRef.pipe(
      switchMap((roomRef: DatabaseReference) =>
        from(
          new Observable<T>((observer) => {
            const unsubscribe = onValue(
              child(roomRef, parameter),
              (snapshot) => {
                observer.next(snapshot.val());
              },
              (error) => {
                observer.error(error);
              },
            );
            return { unsubscribe };
          }),
        ),
      ),
    );
  }

  listenToState(
    roomId: string,
    roundNumber: number,
    stateSubject: Subject<RoundStates>,
  ) {
    const roundStateRef = ref(
      this.database,
      'rooms/' + roomId + '/rounds/' + roundNumber + '/state',
    );
    const stateSubscription = onValue(roundStateRef, (snapshot) => {
      stateSubject.next(snapshot.val());
    });
    return stateSubscription;
  }
}
