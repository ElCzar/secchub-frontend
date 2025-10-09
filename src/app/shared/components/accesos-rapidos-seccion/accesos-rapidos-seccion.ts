import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-accesos-rapidos-seccion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accesos-rapidos-seccion.html',
  styleUrls: ['./accesos-rapidos-seccion.scss']
})
export class AccesosRapidosSeccion {
  items = [
    { label: 'Perfil', route: '/perfil' },
    { label: 'Planificar Clases', route: '/planificacion' },
    { label: 'Confirmar Disponibilidad Docente', route: '/confirmar-disponibilidad' },
    { label: 'Monitores', route: '/solicitud-monitores' },
    { label: 'Cerrar sesión', route: '/' }
  ];

  constructor(private readonly router: Router) {}

  go(item: { label: string; route?: string }) {
    if (item.route) {
      this.router.navigateByUrl(item.route).catch(() => console.warn('Navigation failed', item));
    }
  }
}
