import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-programa-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './programa-registrar.component.html',
  styleUrls: ['./programa-registrar.component.scss']
})
export class ProgramaRegistrarComponent {
  @Input() formGroup!: FormGroup;
}