import { Routes } from '@angular/router';
import { MonitorFormPageComponent } from './features/monitores/pages/monitor-form-page/monitor-form-page.component';
import { ConfirmacionPageComponent } from './features/confirmacion-docentes/pages/confirmacion-page/confirmacion-page.component';
import { ProgramasPageComponent } from './features/programas/pages/programas-page/programas-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';

import { PlanificacionClasesPage } from './features/planificacion/pages/planificacion-page/planificacion-page';
import { DocentesPage } from './features/docentes/pages/docentes-page/docentes-page';

export const routes: Routes = [
  
    {path: '',component: LoginPageComponent },
  
    { path: 'FormularioProgramas', component: ProgramasPageComponent },

    { path: 'FormularioConfirmacionDocentes', component: ConfirmacionPageComponent },
  
    { path: 'FormularioMonitores', component: MonitorFormPageComponent },
  
    { path: 'planificacion', component: PlanificacionClasesPage },
  
    { path: 'docentes', component: DocentesPage },
  
    { path: 'seleccionar-docente', component: DocentesPage }
];
