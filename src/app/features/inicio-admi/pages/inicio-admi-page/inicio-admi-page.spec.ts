import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioAdmiPage } from './inicio-admi-page';

describe('InicioAdmiPage', () => {
  let component: InicioAdmiPage;
  let fixture: ComponentFixture<InicioAdmiPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioAdmiPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioAdmiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
