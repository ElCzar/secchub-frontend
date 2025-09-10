import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourLimit } from './hour-limit';

describe('HourLimit', () => {
  let component: HourLimit;
  let fixture: ComponentFixture<HourLimit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourLimit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HourLimit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
