import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudMonitoresAdminPage } from './solicitud-monitores-admin-page';

describe('SolicitudMonitoresAdminPage', () => {
  let component: SolicitudMonitoresAdminPage;
  let fixture: ComponentFixture<SolicitudMonitoresAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudMonitoresAdminPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudMonitoresAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
