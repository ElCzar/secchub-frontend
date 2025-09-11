import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionPageComponent } from './confirmacion-page.component';

describe('ConfirmacionPageComponent', () => {
  let component: ConfirmacionPageComponent;
  let fixture: ComponentFixture<ConfirmacionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmacionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
