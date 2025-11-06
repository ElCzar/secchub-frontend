import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { InicioSeccionPage } from './inicio-seccion-page';

describe('InicioSeccionPage', () => {
  let component: InicioSeccionPage;
  let fixture: ComponentFixture<InicioSeccionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioSeccionPage, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioSeccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
