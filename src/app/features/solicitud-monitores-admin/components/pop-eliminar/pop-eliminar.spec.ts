import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopEliminar } from './pop-eliminar';

describe('PopEliminar', () => {
  let component: PopEliminar;
  let fixture: ComponentFixture<PopEliminar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopEliminar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopEliminar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
