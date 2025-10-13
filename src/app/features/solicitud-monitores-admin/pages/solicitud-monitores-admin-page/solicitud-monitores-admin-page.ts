import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Monitor } from '../../models/monitor.model';

import { MonitoresTable } from '../../components/monitores-table/monitores-table';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { PopGuardarCambios } from '../../../../shared/components/pop-guardar-cambios/pop-guardar-cambios';
import { PopEnviarCambios } from '../../../../shared/components/pop-enviar-cambios/pop-enviar-cambios';
import { PopExportar } from '../../components/pop-exportar/pop-exportar';
import { SolicitudMonitoresService } from '../../services/solicitud-monitores.service';
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";




@Component({
  selector: 'app-solicitud-monitores-page',
  imports: [CommonModule, FormsModule, MonitoresTable, HeaderComponent, SidebarToggleButtonComponent, PopGuardarCambios, PopEnviarCambios, PopExportar, AccesosRapidosAdmi],
  templateUrl: './solicitud-monitores-admin-page.html',
  styleUrl: './solicitud-monitores-admin-page.scss'
})

export class SolicitudMonitoresAdminPage implements OnInit {
  monitores: Monitor[] = [];
  filteredMonitores: Monitor[] = [];
  adminMonitores: Monitor[] = [];
  nonAdminMonitores: Monitor[] = [];

  // Filtros UI
  searchQuery = '';
  selectedMateria = '';
  selectedSeccion = '';
  materias: string[] = [];
  secciones: string[] = [];
  // Desplegables
  showAdminTable = false;
  showAcademicTable = false;

  // Popup guardar cambios
  showSaveModal = false;
  saveSuccess = true;

  // Popup exportar nómina
  showExportModal = false;
  showExportTable = false;

  constructor(private readonly monitoresService: SolicitudMonitoresService) {}

  ngOnInit(): void {
    this.loadMonitores();
  }

  loadMonitores() {
    this.monitoresService.getMonitores().subscribe(data => {
      this.monitores = data;
      this.materias = Array.from(new Set(this.monitores.map(m => m.asignatura).filter(Boolean as any)))
        .sort((a: string, b: string) => a.localeCompare(b));
      this.secciones = Array.from(new Set(this.monitores.map(m => m.seccionAcademica).filter((seccion): seccion is string => !!seccion)))
        .sort((a: string, b: string) => a.localeCompare(b));
      this.applyFilters();
    });
  }

  onMonitoresUpdate(updatedMonitores: Monitor[]) {
    // Ya no reemplazamos el arreglo fuente para evitar que un cambio en una tabla
    // afecte la otra. Los cambios de estado/editables están vinculados por referencia.
    this.applyFilters();
  }

  guardarCambios() {
    this.monitoresService.updateMonitores(this.monitores).subscribe({
      next: () => {
        this.saveSuccess = true;
        this.showSaveModal = true;
      },
      error: (error) => {
        console.error('Error al guardar cambios:', error);
        this.saveSuccess = false;
        this.showSaveModal = true;
      }
    });
  }

  exportarNomina() {
    const totalMonitoresActivos = this.monitores.length;
    if (totalMonitoresActivos === 0) {
      this.saveSuccess = false;
      this.showSaveModal = true;
      return;
    }
    
    this.showExportTable = true;
  }

  // Método para obtener el total de monitores activos
  get totalMonitoresActivos() {
    return this.monitores.length;
  }

  // Handlers filtros
  onSearchChange() {
    this.applyFilters();
  }

  onMateriaChange() {
    this.applyFilters();
  }

  onSeccionChange() {
    this.applyFilters();
  }

  private applyFilters() {
    const q = this.searchQuery.trim().toLowerCase();
    const mat = this.selectedMateria;
    const sec = this.selectedSeccion;

    const base = this.monitores.filter(m => {
      const matchesQuery = !q || [m.id, m.nombre, m.apellido, m.correo]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q));
      const matchesMateria = !mat || m.asignatura === mat;
      const matchesSeccion = !sec || m.seccionAcademica === sec;
      return matchesQuery && matchesMateria && matchesSeccion;
    });

    // Dividir en administrativos y no administrativos
    this.adminMonitores = base.filter(m => m.administrativo === true);
    this.nonAdminMonitores = base.filter(m => !m.administrativo);
    this.filteredMonitores = base; // por compatibilidad si se usa en otra parte
  }

  // Acciones de aprobar/rechazar (para tabla administrativa inline)
  aceptar(m: Monitor) {
    m.estado = m.estado === 'aceptado' ? 'pendiente' : 'aceptado';
  }

  rechazar(m: Monitor) {
    m.estado = m.estado === 'rechazado' ? 'pendiente' : 'rechazado';
  }

  recalc(m: Monitor) {
    m.totalHoras = (m.horasSemanales || 0) * (m.semanas || 0);
  }

  // Métodos para el popup de guardar cambios
  onSaveModalClosed() {
    this.showSaveModal = false;
  }

  onRetrySave() {
    this.showSaveModal = false;
    this.guardarCambios();
  }

  // Métodos para el popup de exportar nómina
  onConfirmExport() {
    this.showExportModal = false;
    
    // Simular exportación de nómina
    setTimeout(() => {
      this.saveSuccess = true;
      this.showSaveModal = true;
    }, 300);
  }

  onCancelExport() {
    this.showExportModal = false;
  }

  // Métodos para el popup de tabla de exportación
  onCloseExportTable() {
    this.showExportTable = false;
  }

  onConfirmExportTable() {
    this.showExportTable = false;
    
    // Simular exportación de archivo
    setTimeout(() => {
      this.saveSuccess = true;
      this.showSaveModal = true;
    }, 300);
  }
}

