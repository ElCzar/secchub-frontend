import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SolicitudMonitoresPage } from './solicitud-monitores-page';

describe('SolicitudMonitoresPage', () => {
  let component: SolicitudMonitoresPage;
  let fixture: ComponentFixture<SolicitudMonitoresPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudMonitoresPage, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudMonitoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
