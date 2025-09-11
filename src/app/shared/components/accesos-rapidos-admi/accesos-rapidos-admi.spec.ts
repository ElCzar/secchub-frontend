import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesosRapidosAdmi } from './accesos-rapidos-admi';

describe('AccesosRapidosAdmi', () => {
  let component: AccesosRapidosAdmi;
  let fixture: ComponentFixture<AccesosRapidosAdmi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesosRapidosAdmi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesosRapidosAdmi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
