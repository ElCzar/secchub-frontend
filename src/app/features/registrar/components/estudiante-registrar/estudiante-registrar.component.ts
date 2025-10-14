import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estudiante-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estudiante-registrar.component.html',
  styleUrls: ['./estudiante-registrar.component.scss']
})
export class EstudianteRegistrarComponent {
  @Input() formGroup!: FormGroup;
}