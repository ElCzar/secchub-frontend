import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-accesos-rapidos-admi',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accesos-rapidos-admi.html',
  styleUrls: ['./accesos-rapidos-admi.scss']
})
export class AccesosRapidosAdmi {
  items = [
    { label: 'Perfil', route: '/perfil' },
    { label: 'Registrar Nuevo Usuario', route: '/usuarios/nuevo' },
    { label: 'Ver Usuario Registrados', route: '/usuarios' },
    { label: 'Consultar Log de Auditoria', route: '/auditoria' },
    { label: 'Ver Planificacion Completa', route: '/planificacion' },
    { label: 'Gestionar Materias', route: '/materias' },
    { label: 'Enviar formulario a carreras', route: '/formularios/carreras' },
    { label: 'Enviar formulario monitores', route: '/formularios/monitores' },
    { label: 'Ver y Editar Monitores', route: '/monitores' },
    { label: 'Exportar programacion a Intranet', route: '/export' },
    { label: 'Cerrar sesión', route: '/' }
  ];

  constructor(private router: Router) {}

  go(item: { label: string; route?: string }) {
    if (item.route) {
      this.router.navigateByUrl(item.route).catch(() => console.warn('Navigation failed', item));
    }
  }
}