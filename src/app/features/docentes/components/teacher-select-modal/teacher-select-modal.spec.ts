import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSelectModal } from './teacher-select-modal';

describe('TeacherSelectModal', () => {
  let component: TeacherSelectModal;
  let fixture: ComponentFixture<TeacherSelectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherSelectModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherSelectModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
