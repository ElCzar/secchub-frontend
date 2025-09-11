import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulesTableRoom } from './schedules-table-room';

describe('SchedulesTableRoom', () => {
  let component: SchedulesTableRoom;
  let fixture: ComponentFixture<SchedulesTableRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulesTableRoom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulesTableRoom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
