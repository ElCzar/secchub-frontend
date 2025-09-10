import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationTeachers } from './confirmation-teachers';

describe('ConfirmationTeachers', () => {
  let component: ConfirmationTeachers;
  let fixture: ComponentFixture<ConfirmationTeachers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationTeachers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationTeachers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
