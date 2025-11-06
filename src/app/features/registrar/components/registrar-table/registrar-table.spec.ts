import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RegistrarTableComponent } from './registrar-table';

describe('RegistrarTableComponent', () => {
  let component: RegistrarTableComponent;
  let fixture: ComponentFixture<RegistrarTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarTableComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
