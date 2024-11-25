import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicateFeedbackComponent } from './communicate-feedback.component';

describe('CommunicateFeedbackComponent', () => {
  let component: CommunicateFeedbackComponent;
  let fixture: ComponentFixture<CommunicateFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicateFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunicateFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
