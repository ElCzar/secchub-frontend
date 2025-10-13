import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopConfimacion } from './pop-confimacion';

describe('PopConfimacion', () => {
  let component: PopConfimacion;
  let fixture: ComponentFixture<PopConfimacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopConfimacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopConfimacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
