import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionSummaryTable } from './section-summary-table';

describe('SectionSummaryTable', () => {
  let component: SectionSummaryTable;
  let fixture: ComponentFixture<SectionSummaryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionSummaryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionSummaryTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
