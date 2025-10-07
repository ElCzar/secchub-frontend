import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionClasesPage } from './planificacion-page';

describe('PlanificacionClasesPage', () => {
  let component: PlanificacionClasesPage;
  let fixture: ComponentFixture<PlanificacionClasesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanificacionClasesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanificacionClasesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
