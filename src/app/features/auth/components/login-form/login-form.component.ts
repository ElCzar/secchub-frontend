import { Component } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: "app-login-form",
  templateUrl: "./login-form.component.html",
  styleUrls: ["./login-form.component.scss"],
})
export class LoginFormComponent {
  show = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  submit(email: string, password: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.successMessage = 'Inicio de sesión exitoso!';
        }
        else {
          this.errorMessage = response?.message || 'No se recibió token.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Credenciales inválidas.';
      }
    });
  }

}

