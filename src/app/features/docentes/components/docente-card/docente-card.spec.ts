import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocenteCard } from './docente-card';

describe('DocenteCard', () => {
  let component: DocenteCard;
  let fixture: ComponentFixture<DocenteCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocenteCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocenteCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
