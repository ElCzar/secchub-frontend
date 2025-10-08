import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSignature } from './upload-signature';

describe('UploadSignature', () => {
  let component: UploadSignature;
  let fixture: ComponentFixture<UploadSignature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadSignature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadSignature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
