import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentType } from '../../models/common.model';

@Component({
  selector: 'app-personal-data-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-data-form.html',
  styleUrls: ['./personal-data-form.scss']
})
export class PersonalDataForm {
  @Input() documentTypes: DocumentType[] = [];
  @Output() dataChange = new EventEmitter<any>();

  // Modelo de datos
  data = {
    name: '',
    lastName: '',
    username: '',
    email: '',
    documentTypeId: '',
    documentNumber: '',
    faculty: ''
  };

  onFieldChange(): void {
    this.dataChange.emit({ ...this.data });
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
