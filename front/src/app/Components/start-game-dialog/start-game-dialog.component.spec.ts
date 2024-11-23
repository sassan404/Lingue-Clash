import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartGameDialogComponent } from './start-game-dialog.component';

describe('StartGameDialogComponent', () => {
  let component: StartGameDialogComponent;
  let fixture: ComponentFixture<StartGameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartGameDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartGameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
