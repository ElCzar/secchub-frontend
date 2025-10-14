import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { DocumentType } from '../../models/common.model';

@Component({
  selector: 'app-personal-data-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-data-form.html',
  styleUrls: ['./personal-data-form.scss']
})
export class PersonalDataForm {
  @Input() formGroup!: FormGroup;
  @Input() documentTypes: DocumentType[] = [];

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Formato de correo electrónico inválido';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      lastName: 'Apellido',
      username: 'Nombre de usuario',
      email: 'Correo electrónico',
      documentTypeId: 'Tipo de documento',
      documentNumber: 'Número de documento',
      faculty: 'Facultad'
    };
    return labels[fieldName] || fieldName;
  }
}
