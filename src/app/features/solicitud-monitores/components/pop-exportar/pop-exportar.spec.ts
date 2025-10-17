import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopExportar } from './pop-exportar';

describe('PopExportar', () => {
  let component: PopExportar;
  let fixture: ComponentFixture<PopExportar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopExportar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopExportar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
