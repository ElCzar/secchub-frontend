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
    private readonly authService: AuthService,
    private readonly authState: AuthStateService,
    private readonly router: Router
  ) {}

  submit(email: string, password: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.accessToken) {
          // Save tokens to AuthStateService - pass role from backend response
          this.authState.setTokens(response.accessToken, response.refreshToken, response.role);
          
          this.successMessage = 'Inicio de sesión exitoso!';
          
          // Get role from the decoded token (now available in AuthStateService)
          const currentUser = this.authState.getCurrentUser();
          const userRoles = currentUser?.roles || [response.role]; // Fallback to response.role
          
          // Navigate based on role priority (admin > teacher > program > student > user)
          if (userRoles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/inicio-admi']);
          } else if (userRoles.includes('ROLE_TEACHER')) {
            this.router.navigate(['/FormularioConfirmacionDocentes']);
          } else if (userRoles.includes('ROLE_PROGRAM')) {
            this.router.navigate(['/FormularioProgramas']);
          } else if (userRoles.includes('ROLE_STUDENT')) {
            this.router.navigate(['/FormularioMonitores']);
          } else if (userRoles.includes('ROLE_USER')) {
            // Checks if section is disabled for the user
            this.authService.sectionInformation().subscribe(isDisabled => {
              if (isDisabled) {
                this.router.navigate(['/inicio-seccion-deshabilitada']);
              } else {
                this.router.navigate(['/inicio-seccion']);
              }
            });
          } else {
            // Default fallback
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

