import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LogAuditoriaPage } from './log-auditoria-page';

describe('LogAuditoriaPage', () => {
  let component: LogAuditoriaPage;
  let fixture: ComponentFixture<LogAuditoriaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogAuditoriaPage, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogAuditoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
