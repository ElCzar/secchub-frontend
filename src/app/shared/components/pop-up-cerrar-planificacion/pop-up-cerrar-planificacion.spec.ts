import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpCerrarPlanificacion } from './pop-up-cerrar-planificacion';

describe('PopUpCerrarPlanificacion', () => {
  let component: PopUpCerrarPlanificacion;
  let fixture: ComponentFixture<PopUpCerrarPlanificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpCerrarPlanificacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpCerrarPlanificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
