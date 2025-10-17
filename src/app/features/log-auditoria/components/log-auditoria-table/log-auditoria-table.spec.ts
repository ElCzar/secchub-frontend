import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogAuditoriaTable } from './log-auditoria-table';

describe('LogAuditoriaTable', () => {
  let component: LogAuditoriaTable;
  let fixture: ComponentFixture<LogAuditoriaTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogAuditoriaTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogAuditoriaTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
