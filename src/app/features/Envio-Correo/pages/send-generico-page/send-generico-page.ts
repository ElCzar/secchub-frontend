import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EMAIL_TEMPLATES } from '../../../../shared/utils/email-templates';
import { Email } from '../../models/email.model';
import { EmailService } from '../../services/email.service';
import { ActivatedRoute } from '@angular/router';
import { UploadSignature } from "../../components/upload-signature/upload-signature";
import { EmailPreview } from "../../components/email-preview/email-preview";
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-send-generico-page',
  imports: [FormsModule, UploadSignature, EmailPreview, AccesosRapidosSeccion, SidebarToggleButtonComponent, HeaderComponent],
  templateUrl: './send-generico-page.html',
  styleUrls: ['./send-generico-page.scss']
})

export class SendGenericoPage implements OnInit {
  type!: keyof typeof EMAIL_TEMPLATES;
  email: Email = { to: '', subject: '', message: '' };
  signatureUrl?: string;
  signatureText: string = 'Departamento de Ingeniería de Sistemas\nPontificia Universidad Javeriana';
  title = '';

  constructor(private readonly route: ActivatedRoute, private readonly emailService: EmailService) {}

  ngOnInit() {
    this.type = this.route.snapshot.paramMap.get('type') as keyof typeof EMAIL_TEMPLATES;
    const template = EMAIL_TEMPLATES[this.type];
    this.title = template.title;
    this.email.subject = template.subject;
    this.email.message = template.message;
  }

  onSignatureUploaded(url: string) {
    this.signatureUrl = url;
    this.email.signatureUrl = url;
  }

  onSignatureRemoved() {
    this.signatureUrl = undefined;
    delete this.email.signatureUrl;
  }

  onSignatureDataChanged(data: {imageUrl?: string, signatureText: string}) {
    this.signatureUrl = data.imageUrl;
    this.signatureText = data.signatureText;
    
    if (data.imageUrl) {
      this.email.signatureUrl = data.imageUrl;
    } else {
      delete this.email.signatureUrl;
    }
  }

  send() {
    this.emailService.sendEmail(this.email).subscribe(() => {
      alert('Correo enviado correctamente.');
    });
  }
}
