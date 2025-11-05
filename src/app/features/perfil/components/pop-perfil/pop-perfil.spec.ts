import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopPerfilComponent } from './pop-perfil';

describe('PopPerfilComponent', () => {
  let component: PopPerfilComponent;
  let fixture: ComponentFixture<PopPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
