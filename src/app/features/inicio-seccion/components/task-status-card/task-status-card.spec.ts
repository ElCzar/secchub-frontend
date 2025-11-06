import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStatusCard } from './task-status-card';

describe('TaskStatusCard', () => {
  let component: TaskStatusCard;
  let fixture: ComponentFixture<TaskStatusCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskStatusCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskStatusCard);
    component = fixture.componentInstance;
    
    // Proporcionar el input requerido
    fixture.componentRef.setInput('data', {
      classesWithoutRoom: 0,
      classesWithoutTeacher: 0,
      scheduleConflicts: {
        count: 0,
        details: ''
      },
      unconfirmedTeachers: {
        count: 0,
        details: ''
      },
      deadline: {
        date: '2025-12-31',
        daysRemaining: 30
      }
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
