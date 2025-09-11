import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressSummaryTable } from './progress-summary-table';

describe('ProgressSummaryTable', () => {
  let component: ProgressSummaryTable;
  let fixture: ComponentFixture<ProgressSummaryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressSummaryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressSummaryTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
