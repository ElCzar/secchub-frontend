import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusPill } from './status-pill';

describe('StatusPill', () => {
  let component: StatusPill;
  let fixture: ComponentFixture<StatusPill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusPill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
