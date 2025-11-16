import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estudiante-registrar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estudiante-registrar.component.html',
  styleUrls: ['./estudiante-registrar.component.scss']
})
export class EstudianteRegistrarComponent {
  @Output() dataChange = new EventEmitter<any>();

  constructor() {
    // Emit empty data on init since this component has no fields
    setTimeout(() => this.dataChange.emit({}));
  }
}