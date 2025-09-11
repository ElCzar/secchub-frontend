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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
