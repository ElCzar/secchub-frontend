import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorRowActions } from './monitor-row-actions';

describe('MonitorRowActions', () => {
  let component: MonitorRowActions;
  let fixture: ComponentFixture<MonitorRowActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorRowActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorRowActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
