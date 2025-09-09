import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificacionPage } from './planificacion-page';

describe('PlanificacionPage', () => {
  let component: PlanificacionPage;
  let fixture: ComponentFixture<PlanificacionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanificacionPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanificacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
