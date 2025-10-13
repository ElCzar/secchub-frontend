import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopEnviarCambios } from './pop-enviar-cambios';

describe('PopEnviarCambios', () => {
  let component: PopEnviarCambios;
  let fixture: ComponentFixture<PopEnviarCambios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopEnviarCambios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopEnviarCambios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
