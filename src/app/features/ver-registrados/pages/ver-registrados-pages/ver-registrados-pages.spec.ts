import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { VerRegistradosPages } from './ver-registrados-pages';

describe('VerRegistradosPages', () => {
  let component: VerRegistradosPages;
  let fixture: ComponentFixture<VerRegistradosPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerRegistradosPages, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerRegistradosPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
