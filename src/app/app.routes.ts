import { Routes } from '@angular/router';

import { ConfirmacionPageComponent } from './features/confirmacion-docentes/pages/confirmacion-page/confirmacion-page.component';
import { ProgramasPageComponent } from './features/programas/pages/programas-page/programas-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';


export const routes: Routes = [
  {path: '',component: LoginPageComponent },
  
  { path: 'FormularioProgramas', component: ProgramasPageComponent },

  { path: 'FormularioConfirmacionDocentes', component: ConfirmacionPageComponent }
   
];

