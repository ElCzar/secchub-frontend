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
  // IDs de clases seleccionadas para duplicar (todas, normales y anuales)
  selectedClassIds: number[] = [];

  /**
   * Maneja el cambio de selección de cualquier clase
   */
  onToggleClass(classId: number, checked: boolean) {
    if (checked) {
      if (!this.selectedClassIds.includes(classId)) {
        this.selectedClassIds.push(classId);
      }
    } else {
      this.selectedClassIds = this.selectedClassIds.filter(id => id !== classId);
    }
  }
  /**
   * Método público para aplicar la duplicación filtrada desde el template
   */
  onApplySemester() {
    if (!this.previewData) return;
    // Obtener el ID del semestre origen
    const semesterId = this.previewData.semesterId;
    // Obtener los IDs de clases seleccionadas
    const classIds = this.selectedClassIds;
    const payload = {
      semesterId,
      classIds
    };
    console.log('Payload para duplicación:', payload);
    this.planningService.applySelectedSemesterClasses(payload).subscribe({
      next: (response) => {
        console.log('Duplicación exitosa. Clases duplicadas:', classIds);
        alert(`✅ Se duplicaron ${response.classesApplied ?? classIds.length} clases seleccionadas al semestre actual.`);
        this.closeModal.emit();
      },
      error: (err) => {
        // Manejo de error
      }
    });
  }
  /**
   * IDs de materias anuales seleccionadas para duplicar
   */
  selectedAnnualClassIds: number[] = [];

  /**
   * Maneja el cambio de selección de materia anual
   */
  onToggleAnnualClass(classId: number, checked: boolean) {
    if (checked) {
      if (!this.selectedAnnualClassIds.includes(classId)) {
        this.selectedAnnualClassIds.push(classId);
      }
    } else {
      this.selectedAnnualClassIds = this.selectedAnnualClassIds.filter(id => id !== classId);
    }
  }
  annualCount: number = 0;
  
  // Semestre seleccionado
  selectedSemester: string = '';
  
  // Lista de semestres disponibles
  availableSemesters: string[] = [];
  
  // Mapeo dinámico de ID de semestres (año-período -> ID)
  private semesterIdMap: {[key: string]: number} = {};
  
  // Estado de vista previa
  showPreview: boolean = false;
  previewData: {totalClasses: number, semesterId: number, classes: ClassDTO[]} | null = null;
  annualClassIds: number[] = [];
  showAnnualWarning: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  previewMessage: string = '';
  hasClassesInPreview: boolean = false;
  
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
        console.log('🔍 Semestres pasados del backend:', semesters);
        // Convertir los semestres del backend al formato esperado por el componente
        this.availableSemesters = semesters.map(semester => {
          const label = `${semester.year}-${semester.period.toString().padStart(2, '0')}`;
          // Construir el mapa dinámico: label -> ID
          this.semesterIdMap[label] = semester.id;
          console.log(`  ✓ ${label} → ID: ${semester.id}`);
          return label;
        });
        console.log('📋 Mapeo de semestres creado:', this.semesterIdMap);
        console.log('📊 Semestres disponibles cargados:', this.availableSemesters);
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
  // ...existing code...
  // Guardar cantidad de materias anuales
  this.annualCount = 0;
    // Reset preview cuando cambia la selección
    this.showPreview = false;
    this.previewData = null;
    this.error = null;
    this.hasClassesInPreview = false;
    this.annualClassIds = [];
    this.showAnnualWarning = false;
    console.log('Semestre seleccionado:', this.selectedSemester);

    // Obtener el ID del semestre desde el mapa dinámico
    const semesterId = this.semesterIdMap[this.selectedSemester];
    if (!semesterId) return;

    // Obtener clases del semestre y verificar materias inválidas
    this.planningService.getSemesterPlanningPreview(semesterId).subscribe({
      next: async (response) => {
        this.annualClassIds = [];
        this.annualCount = 0;
        if (response.classes && response.classes.length > 0) {
          await Promise.all(
            response.classes.map(async (cls) => {
              try {
                const course = await this.planningService.getCourseById(cls.courseId).toPromise();
                if (course && course.isValid === false) {
                  this.annualClassIds.push(cls.id!);
                  this.annualCount++;
                }
              } catch {}
            })
          );
          this.showAnnualWarning = this.annualClassIds.length > 0;
          this.annualCount = this.annualClassIds.length;
        } else {
          this.showAnnualWarning = false;
          this.annualCount = 0;
        }
      },
      error: () => {
        this.showAnnualWarning = false;
      }
    });
  }

// Revertido: getter annualWarningMessage eliminado para restaurar el estado anterior
  
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
    this.previewMessage = '';
    this.hasClassesInPreview = false;
    
    // Obtener el ID del semestre desde el mapa dinámico
    const semesterId = this.semesterIdMap[this.selectedSemester];
    
    if (!semesterId) {
      this.error = `No se encontró el ID para el semestre ${this.selectedSemester}`;
      this.loading = false;
      return;
    }
    
    console.log(`📥 Obteniendo vista previa para semestre: ${this.selectedSemester} (ID: ${semesterId})`);
    
    this.planningService.getSemesterPlanningPreview(semesterId).subscribe({
      next: async (response) => {
        console.log('✅ Vista previa recibida:', response);
        this.annualClassIds = [];
        this.showAnnualWarning = false;
        if (response.classes && response.classes.length > 0) {
          // Inicializar arrays
          this.annualClassIds = [];
          this.selectedClassIds = [];
          await Promise.all(
            response.classes.map(async (cls) => {
              try {
                const course = await this.planningService.getCourseById(cls.courseId).toPromise();
                if (course && course.isValid === false) {
                  this.annualClassIds.push(cls.id!);
                  // Anual: NO seleccionada por defecto
                } else {
                  // Normal: seleccionada por defecto
                  this.selectedClassIds.push(cls.id!);
                }
              } catch (err) {
                // Si no se puede obtener el curso, marcar como normal y seleccionada
                this.selectedClassIds.push(cls.id!);
              }
            })
          );
          this.showAnnualWarning = this.annualClassIds.length > 0;
          this.previewData = response;
          this.hasClassesInPreview = true;
          this.previewMessage = `Se encontraron ${response.totalClasses} clase(s) planificada(s) para ${this.selectedSemester}`;
        } else {
          this.previewData = response;
          this.hasClassesInPreview = false;
          this.previewMessage = `❌ No hay clases planificadas para el semestre ${this.selectedSemester}`;
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
    this.hasClassesInPreview = false;
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
    
    // Si ya vimos preview y no hay clases, no permitir aplicar
    if (this.showPreview && !this.hasClassesInPreview) {
      this.error = 'No se puede aplicar un semestre sin clases planificadas';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Obtener el ID del semestre desde el mapa dinámico
    const semesterId = this.semesterIdMap[this.selectedSemester];
    
    if (!semesterId) {
      this.error = `No se encontró el ID para el semestre ${this.selectedSemester}`;
      this.loading = false;
      return;
    }
    
    console.log(`🔄 Aplicando planificación del semestre: ${this.selectedSemester} (ID: ${semesterId})`);
    
    this.planningService.applySemesterPlanningToCurrent(semesterId).subscribe({
      next: (response) => {
        console.log('✅ Planificación aplicada exitosamente:', response);
        alert(`✅ Se aplicaron ${response.classesApplied} clases del semestre ${this.selectedSemester} al semestre actual`);
        this.applySemester.emit(this.selectedSemester);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error aplicando planificación:', error);
        this.error = `Error al aplicar la planificación del semestre ${this.selectedSemester}`;
        this.loading = false;
      }
    });
  }
}

