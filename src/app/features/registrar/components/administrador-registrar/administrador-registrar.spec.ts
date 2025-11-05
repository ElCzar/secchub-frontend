import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegistrarComponent } from './administrador-registrar';

describe('AdminRegistrarComponent', () => {
  let component: AdminRegistrarComponent;
  let fixture: ComponentFixture<AdminRegistrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRegistrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRegistrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
