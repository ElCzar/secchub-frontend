import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { EmploymentType } from '../../models/common.model';

@Component({
  selector: 'app-profesror-registrar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profesror-registrar.html',
  styleUrl: './profesror-registrar.scss'
})
export class ProfesrorRegistrar {
  @Input() formGroup!: FormGroup;
  @Input() employmentTypes: EmploymentType[] = [];

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} debe ser menor a ${field.errors['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      employmentTypeId: 'Tipo de vinculación',
      maxHours: 'Horas máximas'
    };
    return labels[fieldName] || fieldName;
  }
}
