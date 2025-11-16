import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionSummaryCard } from './action-summary-card';

describe('ActionSummaryCard', () => {
  let component: ActionSummaryCard;
  let fixture: ComponentFixture<ActionSummaryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionSummaryCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionSummaryCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
