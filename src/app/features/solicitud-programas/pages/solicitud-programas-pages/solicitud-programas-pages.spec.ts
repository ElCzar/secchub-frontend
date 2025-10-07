import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudProgramasPages } from './solicitud-programas-pages';

describe('SolicitudProgramasPages', () => {
  let component: SolicitudProgramasPages;
  let fixture: ComponentFixture<SolicitudProgramasPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudProgramasPages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudProgramasPages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
