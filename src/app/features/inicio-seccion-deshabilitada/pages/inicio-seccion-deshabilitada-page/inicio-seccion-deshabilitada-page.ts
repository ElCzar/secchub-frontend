import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { AuthStateService } from '../../../../core/services/auth-state.service';

@Component({
  selector: 'app-inicio-seccion-deshabilitada-page',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './inicio-seccion-deshabilitada-page.html',
  styleUrl: './inicio-seccion-deshabilitada-page.scss'
})
export class InicioSeccionDeshabilitadaPage {
  private readonly authService = inject(AuthStateService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
