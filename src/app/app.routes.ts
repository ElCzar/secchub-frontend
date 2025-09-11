import { Routes } from '@angular/router';
import { ProgramasPageComponent } from './features/programas/pages/programas-page/programas-page.component';


export const routes: Routes = [
  
  
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component')
        .then(m => m.LoginPageComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }

  { path: 'FormularioProgramas', component: ProgramasPageComponent }

 

];


