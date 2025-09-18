import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accesos-rapidos-seccion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accesos-rapidos-seccion.html',
  styleUrls: ['./accesos-rapidos-seccion.scss']
})
export class AccesosRapidosSeccion implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLElement>;
  @Input() startOpen = false;
  @Input() mode: 'overlay' | 'push' = 'overlay';

  open = false;
  private routerSub?: Subscription;

  items = [
    { label: 'Perfil', route: '/perfil' },
    { label: 'Inicio', route: '/inicio-seccion' },
    { label: 'Planificar Clases', route: '/planificar' },
    { label: 'Confirmar Disponibilidad Docente', route: '/confirmar-disponibilidad' },
    { label: 'Monitores', route: '/monitores' },
    { label: 'Cerrar sesión', route: '/' }
  ];

  constructor(private readonly router: Router, private readonly renderer: Renderer2) {}

  ngOnInit() {
    this.open = !!this.startOpen;
    this.applyPushClass();
    // NOTE: do not auto-close on navigation; user requested closing only via the internal X button.
    // Keep router subscription in case future behavior needs it, but do not change `open` here.
    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        // intentionally left blank to preserve open state across navigation when desired
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  toggle(event?: Event) {
    if (event) event.stopPropagation();
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
    if (this.open) this.renderer.addClass(pageContainer, 'accesos-rapidos--pushed');
    else this.renderer.removeClass(pageContainer, 'accesos-rapidos--pushed');
  }

  go(item: { label: string; route?: string }) {
    if (item.route) this.router.navigateByUrl(item.route).catch(() => console.warn('Navigation failed', item));
  }
}
