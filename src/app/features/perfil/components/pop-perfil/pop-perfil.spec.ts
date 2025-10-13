import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopPerfil } from './pop-perfil';

describe('PopPerfil', () => {
  let component: PopPerfil;
  let fixture: ComponentFixture<PopPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopPerfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
