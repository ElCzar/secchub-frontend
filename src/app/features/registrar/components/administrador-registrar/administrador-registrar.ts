import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-registrar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-registrar.component.html',
  styleUrls: ['./admin-registrar.component.scss']
})
export class AdminRegistrarComponent {
  @Output() dataChange = new EventEmitter<any>();

  constructor() {
    // Emit empty data on init since this component has no fields
    setTimeout(() => this.dataChange.emit({}));
  }
}
