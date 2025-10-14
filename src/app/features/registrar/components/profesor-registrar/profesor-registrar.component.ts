import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmploymentType } from '../../models/common.model';

@Component({
  selector: 'app-profesor-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profesor-registrar.component.html',
  styleUrls: ['./profesor-registrar.component.scss']
})
export class ProfesorRegistrarComponent {
  @Input() formGroup!: FormGroup;
  @Input() employmentTypes: EmploymentType[] = [];

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.formGroup.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `El valor máximo es ${errors['max'].max}`;
    }
    
    return 'Campo inválido';
  }
}