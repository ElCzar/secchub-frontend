import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EmailSendRequestDTO } from '../../../shared/model/dto/notification/EmailSendRequestDTO.model';
import { EmailTemplateRequestDTO } from '../../../shared/model/dto/notification/EmailTemplateRequestDTO.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly baseUrl = environment.apiUrl + '/emails';

  constructor(private readonly http: HttpClient) {}

  sendEmail(emailSendRequestDTO: EmailSendRequestDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, emailSendRequestDTO, { 
      observe: 'response'
    });
  }

  getEmailTemplate(templateName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/templates/name/${templateName}`, { 
      observe: 'response'
    });
  }

  updateEmailTemplate(templateId: string, emailTemplateRequestDTO: EmailTemplateRequestDTO): Observable<any> {
    return this.http.put(`${this.baseUrl}/templates/${templateId}`, emailTemplateRequestDTO, { 
      observe: 'response'
    });
  }

  createEmailTemplate(emailTemplateRequestDTO: EmailTemplateRequestDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/templates`, emailTemplateRequestDTO, { 
      observe: 'response'
    });
  }
}
