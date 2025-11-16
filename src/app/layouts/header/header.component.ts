import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(
    private readonly authState: AuthStateService,
    private readonly router: Router
  ) {}

  logout(): void {
    // Clear auth state and navigate to login
    this.authState.logout();
    void this.router.navigate(['']);
  }

}
