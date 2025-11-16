import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SubjectsTable } from './subjects-table';

describe('SubjectsTable', () => {
  let component: SubjectsTable;
  let fixture: ComponentFixture<SubjectsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectsTable, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
