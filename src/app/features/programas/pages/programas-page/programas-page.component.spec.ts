import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramasPageComponent } from './programas-page.component';

describe('ProgramasPageComponent', () => {
  let component: ProgramasPageComponent;
  let fixture: ComponentFixture<ProgramasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramasPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramasPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
