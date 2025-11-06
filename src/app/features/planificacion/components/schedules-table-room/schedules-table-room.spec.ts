import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SchedulesTableRoom } from './schedules-table-room';

describe('SchedulesTableRoom', () => {
  let component: SchedulesTableRoom;
  let fixture: ComponentFixture<SchedulesTableRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulesTableRoom, HttpClientTestingModule]
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
