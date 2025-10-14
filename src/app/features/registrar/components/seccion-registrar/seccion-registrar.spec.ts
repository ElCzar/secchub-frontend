import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionRegistrar } from './seccion-registrar';

describe('SeccionRegistrar', () => {
  let component: SeccionRegistrar;
  let fixture: ComponentFixture<SeccionRegistrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionRegistrar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionRegistrar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
