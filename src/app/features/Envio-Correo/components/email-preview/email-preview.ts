import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-email-preview',
  imports: [CommonModule],
  templateUrl: './email-preview.html',
  styleUrls: ['./email-preview.scss']
})
export class EmailPreview implements OnChanges {
  @Input() message!: string;
  @Input() signatureUrl?: string;
  @Input() signatureText: string = 'Departamento de Ingeniería de Sistemas\nPontificia Universidad Javeriana';

  linkedMessage: SafeHtml = '' as any;

  constructor(private readonly sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message']) {
      this.linkedMessage = this.buildLinkedMessage(this.message || '');
    }
  }

  private escapeHtml(str: string) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
  }

  private buildLinkedMessage(raw: string): SafeHtml {
    // Escape HTML first to avoid XSS
    let escaped = this.escapeHtml(raw);

    // Linkify URLs (basic pattern)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    escaped = escaped.replace(urlRegex, (url) => {
      const safeUrl = url;
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // Preserve line breaks
    const withBreaks = escaped.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
  }

  get formattedSignatureText(): SafeHtml {
    const escaped = this.escapeHtml(this.signatureText || '');
    const withBreaks = escaped.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
  }

}

