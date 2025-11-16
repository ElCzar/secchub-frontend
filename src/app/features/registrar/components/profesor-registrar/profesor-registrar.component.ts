import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmploymentType } from '../../models/common.model';

@Component({
  selector: 'app-profesor-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profesor-registrar.component.html',
  styleUrls: ['./profesor-registrar.component.scss']
})
export class ProfesorRegistrarComponent {
  @Input() employmentTypes: EmploymentType[] = [];
  @Output() dataChange = new EventEmitter<any>();

  data = {
    employmentTypeId: '',
    maxHours: null
  };

  onFieldChange(): void {
    this.dataChange.emit({ ...this.data });
  }
}