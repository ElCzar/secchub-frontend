import { Routes } from '@angular/router';
import { PlanificacionClasesPage } from './features/planificacion/pages/planificacion-page/planificacion-page';
import { DocentesPage } from './features/docentes/components/docentes-page/docentes-page';

export const routes: Routes = [
    { path: '', component: PlanificacionClasesPage },
    { path: 'docentes', component: DocentesPage },
    { path: 'seleccionar-docente', component: DocentesPage }
];
