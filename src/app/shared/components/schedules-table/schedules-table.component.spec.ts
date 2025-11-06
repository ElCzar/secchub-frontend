import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SchedulesTableComponent } from './schedules-table.component';

describe('SchedulesTableComponent', () => {
  let component: SchedulesTableComponent;
  let fixture: ComponentFixture<SchedulesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulesTableComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
