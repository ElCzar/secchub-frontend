import { Routes } from '@angular/router';
import { MonitorFormPageComponent } from './features/monitores/pages/monitor-form-page/monitor-form-page.component';
import { ConfirmacionPageComponent } from './features/confirmacion-docentes/pages/confirmacion-page/confirmacion-page.component';
import { ProgramasPageComponent } from './features/programas/pages/programas-page/programas-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';

import { PlanificacionClasesPage } from './features/planificacion/pages/planificacion-page/planificacion-page';
import { DocentesPage } from './features/docentes/pages/docentes-page/docentes-page';

import { InicioAdmiPage } from './features/inicio-admi/pages/inicio-admi-page/inicio-admi-page';
import { InicioSeccionPage } from './features/inicio-seccion/pages/inicio-seccion-page/inicio-seccion-page';

export const routes: Routes = [
    {path: '',component: LoginPageComponent },
  
    { path: 'FormularioProgramas', component: ProgramasPageComponent },

    { path: 'FormularioConfirmacionDocentes', component: ConfirmacionPageComponent },
  
    { path: 'FormularioMonitores', component: MonitorFormPageComponent },
  
    { path: 'planificacion', component: PlanificacionClasesPage },
  
    { path: 'docentes', component: DocentesPage },
  
    { path: 'seleccionar-docente', component: DocentesPage },
  
    { path: 'inicio-admi', component: InicioAdmiPage },
  
    { path: 'inicio-seccion', component: InicioSeccionPage }
];


