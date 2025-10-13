import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendGenericoPage } from './send-generico-page';

describe('SendGenericoPage', () => {
  let component: SendGenericoPage;
  let fixture: ComponentFixture<SendGenericoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendGenericoPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendGenericoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
