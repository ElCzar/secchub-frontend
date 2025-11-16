import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemStatusCard } from './system-status-card';

describe('SystemStatusCard', () => {
  let component: SystemStatusCard;
  let fixture: ComponentFixture<SystemStatusCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemStatusCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemStatusCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
