import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanningService, ClassDTO } from '../../services/planning.service';

@Component({
  selector: 'app-pop-duplicacion-semetre',
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-duplicacion-semetre.html',
  styleUrl: './pop-duplicacion-semetre.scss'
})
export class PopDuplicacionSemetre implements OnInit {
  
  // Semestre seleccionado
  selectedSemester: string = '';
  
  // Lista de semestres disponibles
  availableSemesters: string[] = [];
  
  // Estado de vista previa
  showPreview: boolean = false;
  previewData: {totalClasses: number, semesterId: number, classes: ClassDTO[]} | null = null;
  loading: boolean = false;
  error: string | null = null;
  
  // Eventos de salida
  @Output() closeModal = new EventEmitter<void>();
  @Output() applySemester = new EventEmitter<string>();
  
  constructor(private planningService: PlanningService) {}
  
  ngOnInit() {
    this.loadAvailableSemesters();
  }
  
  /**
   * Carga la lista de semestres pasados desde el backend
   */
  private loadAvailableSemesters(): void {
    this.planningService.getPastSemesters().subscribe({
      next: (semesters) => {
        // Convertir los semestres del backend al formato esperado por el componente
        this.availableSemesters = semesters.map(semester => 
          `${semester.year}-${semester.period.toString().padStart(2, '0')}`
        );
        console.log('Semestres disponibles cargados:', this.availableSemesters);
      },
      error: (error) => {
        console.error('Error cargando semestres disponibles:', error);
        // Fallback: usar la lógica anterior si hay error
        this.generateAvailableSemestersFallback();
      }
    });
  }
  
  /**
   * Genera la lista de semestres disponibles como fallback
   * Formato: YYYY-01 (primer semestre) y YYYY-03 (segundo semestre)
   */
  private generateAvailableSemestersFallback(): void {
    const currentYear = new Date().getFullYear();
    const semesters: string[] = [];
    
    // Generar semestres de los últimos 3 años
    for (let year = currentYear; year >= currentYear - 2; year--) {
      semesters.push(`${year}-01`); // Primer semestre
      semesters.push(`${year}-03`); // Segundo semestre
    }
    
    this.availableSemesters = semesters;
  }
  
  /**
   * Maneja el cambio de selección de semestre
   */
  onSemesterChange(): void {
    // Reset preview cuando cambia la selección
    this.showPreview = false;
    this.previewData = null;
    this.error = null;
    console.log('Semestre seleccionado:', this.selectedSemester);
  }
  
  /**
   * Obtener vista previa del semestre seleccionado
   */
  onShowPreview(): void {
    if (!this.selectedSemester) {
      this.error = 'Debe seleccionar un semestre';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Extraer el ID del semestre del formato "YYYY-0X"
    const semesterId = this.parseSemesterId(this.selectedSemester);
    console.log(`Obteniendo vista previa para semestre ID: ${semesterId}`);
    
    this.planningService.getSemesterPlanningPreview(semesterId).subscribe({
      next: (response) => {
        console.log('Vista previa recibida:', response);
        this.previewData = response;
        this.showPreview = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error obteniendo vista previa:', error);
        this.error = 'Error al obtener la vista previa del semestre';
        this.loading = false;
      }
    });
  }
  
  /**
   * Convertir formato de semestre a ID
   */
  private parseSemesterId(semesterStr: string): number {
    // Mapear los semestres existentes basado en los datos de prueba
    const semesterMap: {[key: string]: number} = {
      '2024-01': 1, // 2024-1
      '2024-03': 2, // 2024-2  
      '2025-01': 3  // 2025-1
    };
    
    return semesterMap[semesterStr] || 1; // Default a 1 si no se encuentra
  }
  
  /**
   * Formatear día para mostrar
   */
  formatDay(day: string): string {
    const dayMap: {[key: string]: string} = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes', 
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dayMap[day] || day;
  }
  
  /**
   * Volver a la selección de semestre
   */
  onBackToSelection(): void {
    this.showPreview = false;
    this.previewData = null;
    this.error = null;
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
    if (this.selectedSemester) {
      this.loading = true;
      this.error = null;
      
      const semesterId = this.parseSemesterId(this.selectedSemester);
      console.log(`Aplicando planificación del semestre ID: ${semesterId}`);
      
      this.planningService.applySemesterPlanningToCurrent(semesterId).subscribe({
        next: (response) => {
          console.log('Planificación aplicada exitosamente:', response);
          this.applySemester.emit(this.selectedSemester);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error aplicando planificación:', error);
          this.error = 'Error al aplicar la planificación del semestre';
          this.loading = false;
        }
      });
    }
  }
}
