import { Routes } from '@angular/router';

export const VER_REGISTRADOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ver-registrados-pages/ver-registrados-pages').then(m => m.VerRegistradosPages),
    title: 'Usuarios Registrados - Sistema Universitario'
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./pages/ver-registrados-pages/ver-registrados-pages').then(m => m.VerRegistradosPages),
    title: 'Detalle Usuario - Sistema Universitario'
  }
];