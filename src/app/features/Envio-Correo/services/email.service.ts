import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Email } from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:8080/integration/email'; // Ajusta al backend real

  constructor(private http: HttpClient) {}

  sendEmail(email: Email): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, email);
  }
}
