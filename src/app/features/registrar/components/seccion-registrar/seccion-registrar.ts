import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seccion-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seccion-registrar.component.html',
  styleUrls: ['./seccion-registrar.component.scss']
})
export class SeccionRegistrarComponent {
  @Output() dataChange = new EventEmitter<any>();

  data = {
    sectionName: ''
  };

  onFieldChange(): void {
    this.dataChange.emit({ ...this.data });
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      sectionName: 'Nombre de la sección'
    };
    return labels[fieldName] || fieldName;
  }
}
