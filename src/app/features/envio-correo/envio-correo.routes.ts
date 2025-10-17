import { Routes } from '@angular/router';
import { SendGenericoPage } from './pages/send-generico-page/send-generico-page';


export const ENVIO_CORREO_ROUTES: Routes = [
  { path: ':type', component: SendGenericoPage }
];
