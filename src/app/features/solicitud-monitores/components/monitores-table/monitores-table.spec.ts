import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoresTable } from './monitores-table';

describe('MonitoresTable', () => {
  let component: MonitoresTable;
  let fixture: ComponentFixture<MonitoresTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoresTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoresTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
