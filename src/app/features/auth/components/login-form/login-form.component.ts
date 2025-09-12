import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from "../../services/auth/auth.service";
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { Router } from '@angular/router';

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

  constructor(
    private authService: AuthService,
    private authState: AuthStateService,
    private router: Router
  ) {}

  submit(email: string, password: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.accessToken) {
          this.successMessage = 'Inicio de sesión exitoso!';
          // Suponiendo que el backend devuelve el rol en response.rol
          const role = response.role;
          if (role === 'ROLE_STUDENT') {
            this.router.navigate(['/FormularioMonitores']);
          } else if (role === 'ROLE_TEACHER') {
            this.router.navigate(['/FormularioConfirmacionDocentes']);
          } else if (role === 'ROLE_ADMIN') {
            this.router.navigate(['/inicio-admi']);
          } else if (role === 'ROLE_PROGRAM') {
            this.router.navigate(['/FormularioProgramas']);
          } else if (role === 'ROLE_USER') {
            this.router.navigate(['/inicio-seccion']);
          }
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

