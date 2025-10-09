import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopDuplicacionSemetre } from './pop-duplicacion-semetre';

describe('PopDuplicacionSemetre', () => {
  let component: PopDuplicacionSemetre;
  let fixture: ComponentFixture<PopDuplicacionSemetre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopDuplicacionSemetre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopDuplicacionSemetre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
