import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseWordsComponent } from './choose-words.component';

describe('ChooseWordsComponent', () => {
  let component: ChooseWordsComponent;
  let fixture: ComponentFixture<ChooseWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseWordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
