import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-seccion-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seccion-registrar.component.html',
  styleUrls: ['./seccion-registrar.component.scss']
})
export class SeccionRegistrarComponent {
  @Input() formGroup!: FormGroup;

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      sectionName: 'Nombre de la sección'
    };
    return labels[fieldName] || fieldName;
  }
}
