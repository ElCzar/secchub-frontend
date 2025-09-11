import { Routes } from '@angular/router';
import { InicioAdmiPage } from './features/inicio-admi/pages/inicio-admi-page/inicio-admi-page';
import { InicioSeccionPage } from './features/inicio-seccion/pages/inicio-seccion-page/inicio-seccion-page';

export const routes: Routes = [
    { path: '', component: InicioAdmiPage },
    { path: 'inicio-seccion', component: InicioSeccionPage }
];
