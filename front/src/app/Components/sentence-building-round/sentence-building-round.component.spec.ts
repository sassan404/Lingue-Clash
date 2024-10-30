import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceBuildingRoundComponent } from './sentence-building-round.component';

describe('SentenceBuildingRoundComponent', () => {
  let component: SentenceBuildingRoundComponent;
  let fixture: ComponentFixture<SentenceBuildingRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentenceBuildingRoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentenceBuildingRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
