import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopMessage } from './pop-message';

describe('PopMessage', () => {
  let component: PopMessage;
  let fixture: ComponentFixture<PopMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
