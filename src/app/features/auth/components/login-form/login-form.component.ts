import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from "../../services/auth/auth.service";
import { AuthStateService } from '../../../../core/services/auth-state.service';

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.scss"],
})
export class LoginFormComponent {
  show = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private authState: AuthStateService) {}

  submit(email: string, password: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.accessToken) {
          this.successMessage = 'Inicio de sesión exitoso!';
        } else {
          this.errorMessage = response?.message || 'No se recibió access token.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Credenciales inválidas.';
      }
    });
  }

}

