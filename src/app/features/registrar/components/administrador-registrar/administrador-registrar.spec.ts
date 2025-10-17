import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorRegistrar } from './administrador-registrar';

describe('AdministradorRegistrar', () => {
  let component: AdministradorRegistrar;
  let fixture: ComponentFixture<AdministradorRegistrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorRegistrar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministradorRegistrar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
