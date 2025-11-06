import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AccesosRapidosSeccion } from './accesos-rapidos-seccion';

describe('AccesosRapidosSeccion', () => {
  let component: AccesosRapidosSeccion;
  let fixture: ComponentFixture<AccesosRapidosSeccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesosRapidosSeccion, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesosRapidosSeccion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
