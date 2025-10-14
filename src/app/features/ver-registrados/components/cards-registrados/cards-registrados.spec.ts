import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsRegistrados } from './cards-registrados';

describe('CardsRegistrados', () => {
  let component: CardsRegistrados;
  let fixture: ComponentFixture<CardsRegistrados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsRegistrados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsRegistrados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
