import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDataForm } from './personal-data-form';

describe('PersonalDataForm', () => {
  let component: PersonalDataForm;
  let fixture: ComponentFixture<PersonalDataForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalDataForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalDataForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
