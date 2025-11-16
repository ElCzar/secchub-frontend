import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EMAIL_TEMPLATES } from '../../../../shared/utils/email-templates';
import { EmailService } from '../../services/email.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { EmailSendRequestDTO } from '../../../../shared/model/dto/notification/EmailSendRequestDTO.model';
import { EmailTemplateResponseDTO } from '../../../../shared/model/dto/notification/EmailTemplateResponseDTO.model';
import { AuthStateService, DecodedToken } from '../../../../core/services/auth-state.service';
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";
import { Subscription } from 'rxjs';
import { TeacherDatesService } from '../../../docentes/services/teacher-dates.service';
import { TeacherClassWithDates } from '../../../docentes/models/teacher-dates.model';

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
  private classInfo: any = null;

  constructor(
    private readonly route: ActivatedRoute, 
    private readonly emailService: EmailService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authStateService: AuthStateService,
    private readonly router: Router,
    private readonly teacherDatesService: TeacherDatesService
  ) {}

  ngOnInit() {
    // Subscribe to user authentication state
    this.authStateService.user$.subscribe(user => {
      this.currentUser = user;
    });

    // Check if there's class information in router state (from planning navigation)
    const navigation = this.router.getCurrentNavigation();
    console.log('🔍 Navigation object:', navigation);
    
    let classInfo = null;
    
    // Try to get from current navigation
    if (navigation?.extras.state?.['classInfo']) {
      classInfo = navigation.extras.state['classInfo'];
      console.log('✅ Class info from navigation:', classInfo);
    }
    // If not found, try from history.state
    else if (window.history.state?.['classInfo']) {
      classInfo = window.history.state['classInfo'];
      console.log('✅ Class info from history.state:', classInfo);
    }
    else {
      console.log('❌ No class info found in navigation or history.state');
    }
    
    if (classInfo) {
      this.classInfo = classInfo;
      console.log('📧 Loading professor emails for class:', this.classInfo);
      this.loadProfessorEmails();
    }

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

  private loadProfessorEmails() {
    if (!this.classInfo || !this.classInfo.classId) {
      console.log('❌ No class info available for email pre-population');
      console.log('  - this.classInfo:', this.classInfo);
      return;
    }

    console.log('🔄 Loading professor emails for class ID:', this.classInfo.classId);
    console.log('  - Full class info:', this.classInfo);
    console.log('  - TeacherDatesService available:', !!this.teacherDatesService);
    
    this.teacherDatesService.getTeacherClassesByClassId(this.classInfo.classId).subscribe({
      next: (teacherClasses: TeacherClassWithDates[]) => {
        console.log('✅ Teacher classes received:', teacherClasses);
        console.log('  - Number of teacher assignments:', teacherClasses.length);
        
        // Log each teacher assignment
        teacherClasses.forEach((tc, index) => {
          console.log(`  - Teacher ${index + 1}:`, {
            id: tc.id,
            teacherId: tc.teacherId,
            teacherName: tc.teacherName,
            teacherLastName: tc.teacherLastName,
            teacherEmail: tc.teacherEmail
          });
        });
        
        // Extract unique emails from teacher assignments
        const professorEmails = teacherClasses
          .filter(tc => tc.teacherEmail && tc.teacherEmail.trim() !== '')
          .map(tc => tc.teacherEmail!)
          .filter((email, index, array) => array.indexOf(email) === index); // Remove duplicates
        
        console.log('📧 Extracted professor emails:', professorEmails);
        
        if (professorEmails.length > 0) {
          this.emailSendRequest.to = professorEmails.join(', ');
          console.log('✅ Pre-populated professor emails:', this.emailSendRequest.to);
          
          // Update the input field if it exists
          setTimeout(() => {
            const emailInput = document.getElementById('email-to') as HTMLInputElement;
            if (emailInput) {
              emailInput.value = this.emailSendRequest.to;
              console.log('✅ Updated email input field');
            } else {
              console.log('⚠️ Email input field not found');
            }
            this.cdr.detectChanges();
          }, 100);
        } else {
          console.log('⚠️ No professor emails found for this class');
          console.log('  - All teacher classes have empty emails or were filtered out');
        }
      },
      error: (error) => {
        console.error('❌ Error loading professor emails:', error);
        console.error('  - Error details:', {
          message: error.message,
          status: error.status,
          url: error.url
        });
      }
    });
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
    if (this.isReadyToSend() && !this.isSendingEmail) {
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
    } else if (!this.isReadyToSend()) {
      alert('Por favor ingrese al menos un destinatario válido, asunto y mensaje para enviar el correo.');
    }
  }

  saveDraft() {
    if (this.isValidForSave()) {
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
      alert('Para guardar la plantilla debe ingresar al menos un asunto y un mensaje.');
    }
  }

  /**
   * Validation used when saving a template.
   * For templates of type 'programas' and 'docentes' we allow saving without recipients
   * as long as subject and body are present. For other templates require recipients too.
   */
  isValidForSave(): boolean {
    const hasSubject = !!this.emailSendRequest.subject && this.emailSendRequest.subject.trim() !== '';
    const hasBody = !!this.emailSendRequest.body && this.emailSendRequest.body.trim() !== '';

    // Allow saving as long as subject and body are present. Recipients are optional for templates.
    return hasSubject && hasBody;
  }

  /**
   * Validation used when actually sending an email: requires a valid recipient, subject and body.
   */
  isReadyToSend(): boolean {
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
