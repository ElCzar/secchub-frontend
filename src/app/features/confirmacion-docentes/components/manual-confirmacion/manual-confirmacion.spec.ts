import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualConfirmacion } from './manual-confirmacion';

describe('ManualConfirmacion', () => {
  let component: ManualConfirmacion;
  let fixture: ComponentFixture<ManualConfirmacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualConfirmacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualConfirmacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
