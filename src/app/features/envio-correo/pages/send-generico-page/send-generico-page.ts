import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EMAIL_TEMPLATES } from '../../../../shared/utils/email-templates';
import { EmailService } from '../../services/email.service';
import { ActivatedRoute } from '@angular/router';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { EmailSendRequestDTO } from '../../../../shared/model/dto/notification/EmailSendRequestDTO.model';
import { EmailTemplateResponseDTO } from '../../../../shared/model/dto/notification/EmailTemplateResponseDTO.model';
import { AuthStateService, DecodedToken } from '../../../../core/services/auth-state.service';
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-send-generico-page',
  imports: [FormsModule, AccesosRapidosSeccion, SidebarToggleButtonComponent, HeaderComponent, AccesosRapidosAdmi],
  templateUrl: './send-generico-page.html',
  styleUrls: ['./send-generico-page.scss']
})

export class SendGenericoPage implements OnInit, OnDestroy {
  type!: keyof typeof EMAIL_TEMPLATES;
  emailSendRequest: EmailSendRequestDTO = { to: '', subject: '', body: '' };
  title = '';
  templateName = '';
  emailTemplateId = '';
  currentUser: DecodedToken | null = null;
  isSendingEmail = false;
  private paramSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute, 
    private readonly emailService: EmailService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authStateService: AuthStateService
  ) {}

  ngOnInit() {
    // Subscribe to user authentication state
    this.authStateService.user$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to route params to detect changes (including page reloads)
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      const newType = params.get('type') as keyof typeof EMAIL_TEMPLATES;
      
      // Check if type has changed or if it's the initial load
      if (newType !== this.type || !this.type) {
        this.type = newType;
        this.loadTemplate();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
  }

  private loadTemplate() {
    // Reset form data
    this.emailSendRequest = { to: '', subject: '', body: '' };
    this.emailTemplateId = '';
    
    const template = EMAIL_TEMPLATES[this.type];
    this.title = template.title;
    this.templateName = template.template;

    this.emailService.getEmailTemplate(this.templateName).subscribe({
      next: (response) => {

        if (response.status === 200 && response.body) {
          const emailTemplate: EmailTemplateResponseDTO = response.body as EmailTemplateResponseDTO;
          
          this.emailTemplateId = emailTemplate.id || '';
          this.emailSendRequest.subject = emailTemplate.subject || '';
          this.emailSendRequest.body = emailTemplate.body || '';

          this.cdr.detectChanges();

          setTimeout(() => {
            const subjectInput = document.getElementById('email-subject') as HTMLInputElement;
            const bodyTextarea = document.getElementById('email-message') as HTMLTextAreaElement;
            
            if (subjectInput && this.emailSendRequest.subject) {
              subjectInput.value = this.emailSendRequest.subject;
            }
            
            if (bodyTextarea && this.emailSendRequest.body) {
              bodyTextarea.value = this.emailSendRequest.body;
              bodyTextarea.style.height = 'auto';
              bodyTextarea.style.height = bodyTextarea.scrollHeight + 'px';
            }
            
            this.cdr.detectChanges();
          }, 100);
        } else {
          console.log('No valid response or body');
        }
      },
      error: (error) => {
        console.error('Error loading email template:', error);
      }
    });
  }

  send() {
    if (this.isFormValid() && !this.isSendingEmail) {
      this.isSendingEmail = true;
      
      this.emailService.sendEmail(this.emailSendRequest).subscribe({
        next: (response) => {
          this.isSendingEmail = false;
          if (response.status === 200) {
            alert('Correo enviado exitosamente.');
          } else {
            alert('Error al enviar el correo.');
          }
        },
        error: (error) => {
          this.isSendingEmail = false;
          console.error('Error sending email:', error);
          alert('Error al enviar el correo. Por favor intente nuevamente.');
        }
      });
    } else if (!this.isFormValid()) {
      alert('Por favor complete todos los campos obligatorios.');
    }
  }

  saveDraft() {
    if (this.isFormValid()) {
      const emailTemplateRequestDTO = {
        name: this.templateName,
        subject: this.emailSendRequest.subject,
        body: this.emailSendRequest.body
      };

      if (this.emailTemplateId) {
        this.emailService.updateEmailTemplate(this.emailTemplateId, emailTemplateRequestDTO).subscribe((response) => {
          if (response.status === 200) {
            alert('Borrador actualizado exitosamente.');
          } else {
            alert('Error al actualizar el borrador.');
          }
        });
      } else {
        this.emailService.createEmailTemplate(emailTemplateRequestDTO).subscribe((response) => {
          if (response.status === 201) {
            const createdTemplate: EmailTemplateResponseDTO = response.body as EmailTemplateResponseDTO;
            this.emailTemplateId = createdTemplate.id;
            alert('Borrador guardado exitosamente.');
          } else {
            alert('Error al guardar el borrador.');
          }
        });
      }
    } else {
      alert('Por favor complete todos los campos obligatorios antes de guardar.');
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.emailSendRequest.to &&
      this.emailSendRequest.subject &&
      this.emailSendRequest.body &&
      this.isValidEmail(this.emailSendRequest.to)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  onTextareaInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  isAdmin(): boolean {
    const hasAdminInRoles = this.currentUser?.roles?.includes('ROLE_ADMIN') || false;
    const hasAdminRole = this.currentUser?.role === 'ROLE_ADMIN' || false;
    
    return hasAdminInRoles || hasAdminRole;
  }
}
