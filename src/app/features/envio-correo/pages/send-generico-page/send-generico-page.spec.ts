import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SendGenericoPage } from './send-generico-page';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthStateService } from '../../../../core/services/auth-state.service';

describe('SendGenericoPage', () => {
  let component: SendGenericoPage;
  let fixture: ComponentFixture<SendGenericoPage>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      paramMap: of({ get: () => 'generico' } as any),
      snapshot: { params: {}, queryParams: {} }
    };

    const mockAuthStateService = {
      user$: of({ id: 1, name: 'Test User', email: 'test@example.com' })
    };

    await TestBed.configureTestingModule({
      imports: [SendGenericoPage, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthStateService, useValue: mockAuthStateService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendGenericoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
