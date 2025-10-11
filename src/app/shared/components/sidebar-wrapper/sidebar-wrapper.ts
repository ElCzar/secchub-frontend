import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarToggleService } from '../../services/sidebar-toggle.service';
import { SidebarToggleButtonComponent } from '../sidebar-toggle-button/sidebar-toggle-button';
import { AccesosRapidosAdmi } from '../accesos-rapidos-admi/accesos-rapidos-admi';
import { AccesosRapidosSeccion } from '../accesos-rapidos-seccion/accesos-rapidos-seccion';

@Component({
  selector: 'app-sidebar-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    SidebarToggleButtonComponent,
    AccesosRapidosAdmi,
    AccesosRapidosSeccion
  ],
  templateUrl: './sidebar-wrapper.html',
  styleUrls: ['./sidebar-wrapper.scss']
})
export class SidebarWrapperComponent {
  @Input() role: 'admin' | 'seccion' = 'seccion';

  constructor(public readonly sidebarToggleService: SidebarToggleService) {}
}