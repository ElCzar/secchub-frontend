import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioSeccionDeshabilitadaPage } from './inicio-seccion-deshabilitada-page';

describe('InicioSeccionDeshabilitadaPage', () => {
  let component: InicioSeccionDeshabilitadaPage;
  let fixture: ComponentFixture<InicioSeccionDeshabilitadaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioSeccionDeshabilitadaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioSeccionDeshabilitadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
