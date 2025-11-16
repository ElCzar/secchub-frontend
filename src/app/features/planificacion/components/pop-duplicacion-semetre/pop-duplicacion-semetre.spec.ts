import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PopDuplicacionSemetre } from './pop-duplicacion-semetre';

describe('PopDuplicacionSemetre', () => {
  let component: PopDuplicacionSemetre;
  let fixture: ComponentFixture<PopDuplicacionSemetre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopDuplicacionSemetre, HttpClientTestingModule]
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
