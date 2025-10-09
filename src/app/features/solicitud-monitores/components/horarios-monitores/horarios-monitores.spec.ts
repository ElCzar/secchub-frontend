import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosMonitores } from './horarios-monitores';

describe('HorariosMonitores', () => {
  let component: HorariosMonitores;
  let fixture: ComponentFixture<HorariosMonitores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosMonitores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorariosMonitores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
