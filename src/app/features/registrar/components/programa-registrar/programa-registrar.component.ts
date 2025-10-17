import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-programa-registrar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './programa-registrar.component.html',
  styleUrls: ['./programa-registrar.component.scss']
})
export class ProgramaRegistrarComponent {
  @Output() dataChange = new EventEmitter<any>();

  constructor() {
    // Emit empty data on init since this component has no fields
    setTimeout(() => this.dataChange.emit({}));
  }
}