import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudMonitoresService } from '../../services/solicitud-monitores.service';
import { MonitoresTable } from '../../components/monitores-table/monitores-table';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { PopGuardarCambios } from '../../../../shared/components/pop-guardar-cambios/pop-guardar-cambios';
import { PopEnviarCambios } from '../../../../shared/components/pop-enviar-cambios/pop-enviar-cambios';
import { StudentApplicationResponseDTO } from '../../../../shared/model/dto/integration/StudentApplicationResponseDTO.model';

@Component({
  selector: 'app-solicitud-monitores-page',
  imports: [CommonModule, FormsModule, MonitoresTable, AccesosRapidosSeccion, HeaderComponent, SidebarToggleButtonComponent, PopGuardarCambios, PopEnviarCambios],
  templateUrl: './solicitud-monitores-page.html',
  styleUrl: './solicitud-monitores-page.scss'
})

export class SolicitudMonitoresPage implements OnInit {
  monitores: StudentApplicationResponseDTO[] = [];
  filteredMonitores: StudentApplicationResponseDTO[] = [];
  adminMonitores: StudentApplicationResponseDTO[] = [];
  nonAdminMonitores: StudentApplicationResponseDTO[] = [];

  // UI Filters
  searchQuery = '';
  selectedMateria = '';
  selectedSeccion = '';
  materias: [] = [];
  secciones: string[] = [];

  // Toggle tables
  showAdminTable = false;
  showAcademicTable = false;

  // Popup save changes
  showSaveModal = false;
  saveSuccess = true;

  // Popup send changes
  showSendModal = false;

  constructor(private readonly monitoresService: SolicitudMonitoresService) {}

  ngOnInit(): void {
    this.loadMonitores();
  }

  loadMonitores() {
    this.monitoresService.getMonitores().subscribe(data => {
      this.monitores = data as StudentApplicationResponseDTO[];
      this.materias = Array.from(new Set(this.monitores.map(m => m.courseId).filter(Boolean as any)))
        .sort((a: number, b: number) => a - b);
      this.secciones = Array.from(new Set(this.monitores.map(m => m.sectionId).filter((seccion): seccion is number => !!seccion)))
        .sort((a: number, b: number) => a - b);
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

  enviarAAdministrador() {
    const totalSeleccionados = this.monitores.filter(m => m.estado === 'aceptado' || m.estado === 'rechazado').length;
    if (totalSeleccionados === 0) {
      this.saveSuccess = false;
      this.showSaveModal = true;
      return;
    }
    
    this.showSendModal = true;
  }

  // Método para obtener el conteo de cambios
  get cambiosCount() {
    return this.monitores.filter(m => m.estado === 'aceptado' || m.estado === 'rechazado').length;
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

  // Métodos para el popup de enviar cambios
  onConfirmSend() {
    this.showSendModal = false;
    
    // Simular envío
    setTimeout(() => {
      this.saveSuccess = true;
      this.showSaveModal = true;
    }, 300);
  }

  onCancelSend() {
    this.showSendModal = false;
  }
}

