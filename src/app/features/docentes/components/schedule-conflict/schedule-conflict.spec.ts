import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleConflict } from './schedule-conflict';

describe('ScheduleConflict', () => {
  let component: ScheduleConflict;
  let fixture: ComponentFixture<ScheduleConflict>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleConflict]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleConflict);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
