import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesrorRegistrar } from './profesror-registrar';

describe('ProfesrorRegistrar', () => {
  let component: ProfesrorRegistrar;
  let fixture: ComponentFixture<ProfesrorRegistrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesrorRegistrar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesrorRegistrar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
