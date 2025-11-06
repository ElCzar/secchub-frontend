import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PlanningClassesTable } from './planning-classes-table';

describe('PlanningClassesTable', () => {
  let component: PlanningClassesTable;
  let fixture: ComponentFixture<PlanningClassesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningClassesTable, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningClassesTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
