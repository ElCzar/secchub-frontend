import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ProgressSummaryTable } from './progress-summary-table';

describe('ProgressSummaryTable', () => {
  let component: ProgressSummaryTable;
  let fixture: ComponentFixture<ProgressSummaryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressSummaryTable, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressSummaryTable);
    component = fixture.componentInstance;
    
    // Proporcionar el input requerido
    fixture.componentRef.setInput('data', {
      requestsReceived: 'completed' as const,
      roomsAssigned: 'incomplete' as const,
      teachersAssigned: 'incomplete' as const,
      confirmationsSent: 'pending' as const,
      confirmationsReceived: {
        status: 'pending' as const,
        count: 0
      },
      scheduleConflicts: {
        status: 'conflict' as const,
        count: 0
      }
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
