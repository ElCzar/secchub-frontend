import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder,Validators,ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  show = false; 
}
