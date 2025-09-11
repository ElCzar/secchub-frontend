import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorFormPageComponent } from './monitor-form-page.component';

describe('MonitorFormPageComponent', () => {
  let component: MonitorFormPageComponent;
  let fixture: ComponentFixture<MonitorFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorFormPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
