import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservacionesModal } from './observaciones-modal';

describe('ObservacionesModal', () => {
  let component: ObservacionesModal;
  let fixture: ComponentFixture<ObservacionesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservacionesModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservacionesModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
