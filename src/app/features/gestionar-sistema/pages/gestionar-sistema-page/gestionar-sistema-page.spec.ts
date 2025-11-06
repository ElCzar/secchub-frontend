import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GestionarSistemaPage } from './gestionar-sistema-page';

describe('GestionarSistemaPage', () => {
  let component: GestionarSistemaPage;
  let fixture: ComponentFixture<GestionarSistemaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarSistemaPage, HttpClientTestingModule]
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
