import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accesos-rapidos-admi',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accesos-rapidos-admi.html',
  styleUrls: ['./accesos-rapidos-admi.scss']
})
export class AccesosRapidosAdmi implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;
  @Input() startOpen = false;
  /** 'overlay' (default) or 'push' - push will shift the main .container when open */
  @Input() mode: 'overlay' | 'push' = 'overlay';

  open = false;
  private routerSub?: Subscription;
  items = [
    { label: 'Perfil', route: '/perfil' },
    { label: 'Inicio', route: '/inicio-admi' },
    { label: 'Registrar Nuevo Usuario', route: '/usuarios/nuevo' },
    { label: 'Ver Usuario Registrados', route: '/usuarios' },
    { label: 'Consultar Log de Auditoria', route: '/auditoria' },
    { label: 'Ver Planificacion Completa', route: '/planificacion' },
    { label: 'Gestionar Materias', route: '/materias' },
    { label: 'Enviar formulario a carreras', route: '/formularios/carreras' },
    { label: 'Enviar formulario monitores', route: '/formularios/monitores' },
    { label: 'Ver y Editar Monitores', route: '/monitores' },
    { label: 'Exportar programacion a Intranet', route: '/export' },
    { label: 'Cerrar sesión', route: '/logout' }
  ];

  constructor(private readonly router: Router, private readonly renderer: Renderer2) {}

  ngOnInit() {
    // initialize open state from input
    this.open = !!this.startOpen;
    this.applyPushClass();
    // close menu on navigation
    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        this.open = false;
        this.applyPushClass();
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  toggle(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.open = !this.open;
    this.applyPushClass();
  }

  close() {
    this.open = false;
    this.applyPushClass();
  }

  private applyPushClass() {
    if (this.mode !== 'push') return;
    const pageContainer = document.querySelector('.container');
    if (!pageContainer) return;
    if (this.open) {
      this.renderer.addClass(pageContainer, 'accesos-rapidos--pushed');
    } else {
      this.renderer.removeClass(pageContainer, 'accesos-rapidos--pushed');
    }
  }

  // El cierre ahora se hace solo con el botón 'X'. Se han eliminado handlers de click fuera y Escape.

  go(item: { label: string; route?: string }) {
    if (item.route) {
      this.router.navigateByUrl(item.route).catch(() => console.warn('Navigation failed', item));
    }
  }
}
