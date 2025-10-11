import { Component, OnInit } from '@angular/core';
import { Monitor } from '../../models/monitor.model';
import { SolicitudMonitoresService } from '../../services/solicitud-monitores.service';
import { MonitoresTable } from '../../components/monitores-table/monitores-table';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';

@Component({
  selector: 'app-solicitud-monitores-page',
  imports: [MonitoresTable, AccesosRapidosSeccion, HeaderComponent, SidebarToggleButtonComponent],
  templateUrl: './solicitud-monitores-page.html',
  styleUrl: './solicitud-monitores-page.scss'
})

export class SolicitudMonitoresPage implements OnInit {
  monitores: Monitor[] = [];

  constructor(private readonly monitoresService: SolicitudMonitoresService) {}

  ngOnInit(): void {
    this.loadMonitores();
  }

  loadMonitores() {
    this.monitoresService.getMonitores().subscribe(data => {
      this.monitores = data;
    });
  }

  onMonitoresUpdate(updatedMonitores: Monitor[]) {
    this.monitores = updatedMonitores;
  }

  guardarCambios() {
    this.monitoresService.updateMonitores(this.monitores).subscribe(() => {
      alert('Cambios guardados correctamente');
    });
  }
}

