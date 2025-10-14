import { Routes } from '@angular/router';
import { MonitorFormPageComponent } from './features/monitores/pages/monitor-form-page/monitor-form-page.component';
import { ConfirmacionPageComponent } from './features/confirmacion-docentes/pages/confirmacion-page/confirmacion-page.component';
import { ProgramasPageComponent } from './features/programas/pages/programas-page/programas-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page/login-page.component';

import { PlanificacionClasesPage } from './features/planificacion/pages/planificacion-page/planificacion-page';
import { DocentesPage } from './features/docentes/pages/docentes-page/docentes-page';

import { InicioAdmiPage } from './features/inicio-admi/pages/inicio-admi-page/inicio-admi-page';
import { InicioSeccionPage } from './features/inicio-seccion/pages/inicio-seccion-page/inicio-seccion-page';
import { SolicitudProgramasPages } from './features/solicitud-programas/pages/solicitud-programas-pages/solicitud-programas-pages';
import { ENVIO_CORREO_ROUTES } from './features/envio-correo/envio-correo.routes';
import { SolicitudMonitoresPage } from './features/solicitud-monitores/pages/solicitud-monitores-page/solicitud-monitores-page';
import { SolicitudMonitoresAdminPage } from './features/solicitud-monitores-admin/pages/solicitud-monitores-admin-page/solicitud-monitores-admin-page';
import { RegistrarPage } from './features/registrar/pages/registrar-page/registrar-page';
import { VerRegistradosPages } from './features/ver-registrados/pages/ver-registrados-pages/ver-registrados-pages';

export const routes: Routes = [
    {path: '',component: LoginPageComponent },
  
    { path: 'FormularioProgramas', component: ProgramasPageComponent },

    { path: 'FormularioConfirmacionDocentes', component: ConfirmacionPageComponent },
  
    { path: 'FormularioMonitores', component: MonitorFormPageComponent },
  
    { path: 'planificacion', component: PlanificacionClasesPage },
  
    { path: 'docentes', component: DocentesPage },
  
    { path: 'seleccionar-docente', component: DocentesPage },
  
    { path: 'inicio-admi', component: InicioAdmiPage },
  
    { path: 'inicio-seccion', component: InicioSeccionPage },

    { path: 'solicitud-programas', component: SolicitudProgramasPages },

    {path: 'envio-correo', children: ENVIO_CORREO_ROUTES},

    {path: 'solicitud-monitores', component: SolicitudMonitoresPage},

    {path: 'solicitud-monitores-admin', component: SolicitudMonitoresAdminPage},

    {path: 'registrar', component: RegistrarPage},

    {path: 'ver-registrados', component: VerRegistradosPages}
];


