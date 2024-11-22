import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameExplanationDialogComponent } from './game-explanation-dialog.component';

describe('GameExplanationDialogComponent', () => {
  let component: GameExplanationDialogComponent;
  let fixture: ComponentFixture<GameExplanationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameExplanationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameExplanationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
