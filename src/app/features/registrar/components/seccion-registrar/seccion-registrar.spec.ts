import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionRegistrarComponent } from './seccion-registrar';

describe('SeccionRegistrarComponent', () => {
  let component: SeccionRegistrarComponent;
  let fixture: ComponentFixture<SeccionRegistrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionRegistrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeccionRegistrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
