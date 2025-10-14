import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-registrar.component.html',
  styleUrls: ['./admin-registrar.component.scss']
})
export class AdminRegistrarComponent {
  @Input() formGroup!: FormGroup;
}
