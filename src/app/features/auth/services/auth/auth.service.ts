import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { AuthTokenDto, LoginDto } from '../../models/auth.models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(dto: LoginDto): Observable<AuthTokenDto> {
    return this.http.post<AuthTokenDto>(`${this.baseUrl}/auth/login`, dto);
  }
}
