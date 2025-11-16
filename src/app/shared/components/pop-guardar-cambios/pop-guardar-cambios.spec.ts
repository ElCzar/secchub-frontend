import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopGuardarCambios } from './pop-guardar-cambios';

describe('PopGuardarCambios', () => {
  let component: PopGuardarCambios;
  let fixture: ComponentFixture<PopGuardarCambios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopGuardarCambios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopGuardarCambios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
