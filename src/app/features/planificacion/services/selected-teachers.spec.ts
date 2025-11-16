import { TestBed } from '@angular/core/testing';

import { SelectedTeachers } from './selected-teachers';

describe('SelectedTeachers', () => {
  let service: SelectedTeachers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedTeachers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
