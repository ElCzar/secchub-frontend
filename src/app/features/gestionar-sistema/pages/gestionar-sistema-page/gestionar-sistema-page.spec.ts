import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarSistemaPage } from './gestionar-sistema-page';

describe('GestionarSistemaPage', () => {
  let component: GestionarSistemaPage;
  let fixture: ComponentFixture<GestionarSistemaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarSistemaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarSistemaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
