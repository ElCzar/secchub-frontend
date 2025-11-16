import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AuthTokenDto, LoginDto } from '../../models/auth.models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthStateService } from '../../../../core/services/auth-state.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient, private readonly authState: AuthStateService) { }

  login(dto: LoginDto): Observable<AuthTokenDto> {
    return this.http.post<AuthTokenDto>(`${this.baseUrl}/auth/login`, dto).pipe(
      tap(res => {
        if (res.accessToken) {
          this.authState.setTokens(res.accessToken, res.refreshToken);
        }
      })
    );
  }

  // The response is text adjust it
  sectionInformation(): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/sections/is-planning-closed`);
  }
}
