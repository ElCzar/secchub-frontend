import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Monitor } from '../../models/monitor.model';
import { SolicitudMonitoresService } from '../../services/solicitud-monitores.service';
import { MonitoresTable } from '../../components/monitores-table/monitores-table';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';

@Component({
  selector: 'app-solicitud-monitores-page',
  imports: [CommonModule, FormsModule, MonitoresTable, AccesosRapidosSeccion, HeaderComponent, SidebarToggleButtonComponent],
  templateUrl: './solicitud-monitores-page.html',
  styleUrl: './solicitud-monitores-page.scss'
})

export class SolicitudMonitoresPage implements OnInit {
  monitores: Monitor[] = [];
  filteredMonitores: Monitor[] = [];

  // Filtros UI
  searchQuery = '';
  selectedMateria = '';
  materias: string[] = [];

  constructor(private readonly monitoresService: SolicitudMonitoresService) {}

  ngOnInit(): void {
    this.loadMonitores();
  }

  loadMonitores() {
    this.monitoresService.getMonitores().subscribe(data => {
      this.monitores = data;
      this.materias = Array.from(new Set(this.monitores.map(m => m.asignatura).filter(Boolean as any)))
        .sort((a: string, b: string) => a.localeCompare(b));
      this.applyFilters();
    });
  }

  onMonitoresUpdate(updatedMonitores: Monitor[]) {
    this.monitores = updatedMonitores;
    this.applyFilters();
  }

  guardarCambios() {
    this.monitoresService.updateMonitores(this.monitores).subscribe(() => {
      alert('Cambios guardados correctamente');
    });
  }

  // Handlers filtros
  onSearchChange() {
    this.applyFilters();
  }

  onMateriaChange() {
    this.applyFilters();
  }

  private applyFilters() {
    const q = this.searchQuery.trim().toLowerCase();
    const mat = this.selectedMateria;

    this.filteredMonitores = this.monitores.filter(m => {
      const matchesQuery = !q || [m.id, m.nombre, m.apellido, m.correo]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q));
      const matchesMateria = !mat || m.asignatura === mat;
      return matchesQuery && matchesMateria;
    });
  }
}

