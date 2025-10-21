import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramasService } from '../../services/programas.service';
import { AcademicRequestResponseDTO } from '../../models/academic-request.models';
import { SemesterResponseDTO } from '../../../../shared/model/dto/admin/SemesterResponseDTO.model';

interface PreviewData {
  totalRequests: number;
  semesterId: number;
  requests: AcademicRequestResponseDTO[];
}

@Component({
  selector: 'app-pop-duplicacion-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-duplicacion-solicitud.component.html',
  styleUrls: ['./pop-duplicacion-solicitud.component.scss']
})
export class PopDuplicacionSolicitudComponent implements OnInit {
  
  // Semestre seleccionado
  selectedSemester: string = '';
  
  // Lista de semestres disponibles
  availableSemesters: string[] = [];
  
  // Mapeo dinámico de ID de semestres (año-período -> ID)
  private semesterIdMap: {[key: string]: number} = {};
  
  // Estado de vista previa
  showPreview: boolean = false;
  previewData: PreviewData | null = null;
  loading: boolean = false;
  error: string | null = null;
  previewMessage: string = '';
  hasRequestsInPreview: boolean = false;
  
  // Eventos de salida
  @Output() closeModal = new EventEmitter<void>();
  @Output() applySemester = new EventEmitter<AcademicRequestResponseDTO[]>();
  
  constructor(private programasService: ProgramasService) {}
  
  ngOnInit() {
    this.loadAvailableSemesters();
  }
  
  /**
   * Carga la lista de semestres disponibles desde el backend (excluyendo el actual)
   */
  private loadAvailableSemesters(): void {
    this.loading = true;
    this.error = null;
    
    this.programasService.getAllSemestersExceptCurrent().subscribe({
      next: (semesters: SemesterResponseDTO[]) => {
        console.log('📋 Semestres disponibles cargados:', semesters);
        
        // Mapear semestres a formato de display y crear mapeo de IDs
        this.availableSemesters = semesters.map(sem => `${sem.year}-${sem.period}`);
        
        // Crear mapeo de semestre string a ID real
        this.semesterIdMap = {};
        semesters.forEach(sem => {
          const key = `${sem.year}-${sem.period}`;
          this.semesterIdMap[key] = sem.id;
        });
        
        console.log('📊 Semestres disponibles para solicitudes:', this.availableSemesters);
        console.log('📋 Mapeo de semestres:', this.semesterIdMap);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar semestres:', error);
        this.error = 'Error al cargar los semestres disponibles';
        this.loading = false;
        
        // Fallback: usar solo el semestre anterior como opción mínima
        this.loadFallbackSemesters();
      }
    });
  }

  /**
   * Carga semestres de respaldo cuando falla la carga desde backend
   */
  private loadFallbackSemesters(): void {
    console.log('� Cargando semestres de respaldo...');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Solo el semestre inmediatamente anterior como respaldo
    if (currentMonth <= 6) {
      // Primer semestre actual -> semestre anterior es 2 del año pasado
      this.availableSemesters = [`${currentYear - 1}-2`];
      this.semesterIdMap[`${currentYear - 1}-2`] = (currentYear - 1) * 10 + 2;
    } else {
      // Segundo semestre actual -> semestre anterior es 1 del año actual
      this.availableSemesters = [`${currentYear}-1`];
      this.semesterIdMap[`${currentYear}-1`] = currentYear * 10 + 1;
    }
  }
  
  /**
   * Maneja el cambio de selección de semestre
   */
  onSemesterChange(): void {
    // Reset preview cuando cambia la selección
    this.showPreview = false;
    this.previewData = null;
    this.error = null;
    this.hasRequestsInPreview = false;
    console.log('Semestre seleccionado:', this.selectedSemester);
  }
  
  /**
   * Obtiene vista previa de las solicitudes del semestre seleccionado
   */
  onShowPreview(): void {
    if (!this.selectedSemester) {
      this.error = 'Debe seleccionar un semestre';
      return;
    }
    
    const selectedSemesterId = this.semesterIdMap[this.selectedSemester];
    if (!selectedSemesterId) {
      this.error = 'Semestre seleccionado inválido';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.previewMessage = '';
    this.hasRequestsInPreview = false;
    
    console.log(`📥 Obteniendo vista previa para semestre: ${this.selectedSemester} (ID: ${selectedSemesterId})`);
    
    // Usar el ID del semestre seleccionado para obtener las solicitudes
    this.programasService.getAcademicRequestsBySemester(selectedSemesterId).subscribe({
      next: (requests: AcademicRequestResponseDTO[]) => {
        console.log('✅ Vista previa recibida:', requests);
        
        if (requests && requests.length > 0) {
          this.previewData = {
            totalRequests: requests.length,
            semesterId: this.semesterIdMap[this.selectedSemester] || 0,
            requests: requests
          };
          this.hasRequestsInPreview = true;
          this.previewMessage = `Se encontraron ${requests.length} solicitud(es) académica(s) para ${this.selectedSemester}`;
        } else {
          this.previewData = {
            totalRequests: 0,
            semesterId: this.semesterIdMap[this.selectedSemester] || 0,
            requests: []
          };
          this.hasRequestsInPreview = false;
          this.previewMessage = `❌ No hay solicitudes académicas para el semestre ${this.selectedSemester}`;
        }
        
        this.showPreview = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error obteniendo vista previa:', error);
        this.error = `Error al obtener la vista previa del semestre ${this.selectedSemester}`;
        this.loading = false;
      }
    });
  }
  
  /**
   * Formatear día para mostrar
   */
  formatDay(day: string): string {
    const dayMap: {[key: string]: string} = {
      // Días en español
      'LUNES': 'Lunes',
      'MARTES': 'Martes', 
      'MIERCOLES': 'Miércoles',
      'MIÉRCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'SÁBADO': 'Sábado',
      'DOMINGO': 'Domingo',
      // Abreviaciones en español
      'LUN': 'Lunes',
      'MAR': 'Martes',
      'MIE': 'Miércoles',
      'JUE': 'Jueves',
      'VIE': 'Viernes',
      'SAB': 'Sábado',
      'DOM': 'Domingo',
      // Días en inglés (desde el backend)
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    
    return dayMap[day?.toUpperCase()] || day;
  }
  
  /**
   * Formatear modalidad para mostrar
   */
  formatModality(modalityId: number): string {
    const modalityMap: {[key: number]: string} = {
      1: 'Presencial',
      2: 'Virtual',
      3: 'Híbrido'
    };
    return modalityMap[modalityId] || 'Presencial';
  }
  
  /**
   * Volver a la selección de semestre
   */
  onBackToSelection(): void {
    this.showPreview = false;
    this.previewData = null;
    this.error = null;
    this.hasRequestsInPreview = false;
  }
  
  /**
   * Cierra el popup sin aplicar cambios
   */
  onClose(): void {
    this.closeModal.emit();
  }
  
  /**
   * Aplica la duplicación del semestre seleccionado
   */
  onApply(): void {
    if (!this.selectedSemester) {
      this.error = 'Debe seleccionar un semestre';
      return;
    }
    
    const selectedSemesterId = this.semesterIdMap[this.selectedSemester];
    if (!selectedSemesterId) {
      this.error = 'Semestre seleccionado inválido';
      return;
    }
    
    // Si ya tenemos preview data, usar esas solicitudes directamente
    if (this.previewData && this.previewData.requests) {
      console.log(`🔄 Aplicando solicitudes del semestre desde preview: ${this.selectedSemester}`);
      this.applySemester.emit(this.previewData.requests);
      return;
    }
    
    // Si no hay preview, obtener las solicitudes del semestre seleccionado
    this.loading = true;
    this.error = null;
    
    console.log(`🔄 Aplicando solicitudes del semestre: ${this.selectedSemester} (ID: ${selectedSemesterId})`);
    
    this.programasService.getAcademicRequestsBySemester(selectedSemesterId).subscribe({
      next: (requests: AcademicRequestResponseDTO[]) => {
        console.log('✅ Solicitudes aplicadas exitosamente:', requests);
        this.applySemester.emit(requests);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error aplicando solicitudes:', error);
        this.error = `Error al aplicar las solicitudes del semestre ${this.selectedSemester}`;
        this.loading = false;
      }
    });
  }
}