import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanningService, ClassDTO } from '../../services/planning.service';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { forkJoin } from 'rxjs';

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
    
    // Obtener los IDs de clases seleccionadas
    const classIds = this.selectedClassIds;
    
    if (classIds.length === 0) {
      this.error = 'Debe seleccionar al menos una clase para duplicar';
      return;
    }
    
    console.log('IDs de clases a duplicar:', classIds);
    
    this.loading = true;
    this.error = null;
    
    // Usar el nuevo endpoint de duplicación
    this.planningService.duplicateClasses(classIds).subscribe({
      next: (response) => {
        console.log('Duplicación exitosa. Clases duplicadas:', response.length);
        alert(`✅ Se duplicaron ${response.length} clases seleccionadas al semestre actual.`);
        this.loading = false;
        // Cerrar modal y recargar la página para reflejar los cambios
        this.closeModal.emit();
        // Recargar la página para que la vista principal se actualice con las clases duplicadas
        try {
          globalThis.location.reload();
        } catch (e) {
          // Fallback: si por alguna razón no se puede recargar, loguear el error
          console.warn('No se pudo recargar la página automáticamente:', e);
        }
      },
      error: (err) => {
        console.error('Error duplicando clases:', err);
        this.error = 'Error al duplicar las clases seleccionadas';
        this.loading = false;
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
  
  // Mapeo de courseId -> nombre del curso
  private courseNameMap: {[key: number]: string} = {};
  
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
  
  constructor(
    private planningService: PlanningService,
    private semesterService: SemesterInformationService,
    private courseService: CourseInformationService
  ) {}
  
  ngOnInit() {
    this.loadAvailableSemesters();
    this.loadAllCourses();
  }
  
  /**
   * Carga todos los cursos y crea un mapa de ID -> nombre
   */
  private loadAllCourses(): void {
    console.log('🔍 Cargando todos los cursos...');
    this.courseService.findAllCourses().subscribe({
      next: (courses) => {
        console.log('📚 Cursos cargados:', courses.length);
        // Crear mapa de courseId -> courseName
        courses.forEach(course => {
          if (course.id && course.name) {
            this.courseNameMap[course.id] = course.name;
          }
        });
        console.log('📋 Mapa de cursos creado:', this.courseNameMap);
      },
      error: (error) => {
        console.error('❌ Error cargando cursos:', error);
      }
    });
  }
  
  /**
   * Carga la lista de semestres pasados desde el backend
   * Obtiene todos los semestres y excluye el actual
   */
  private loadAvailableSemesters(): void {
    console.log('🔍 Cargando todos los semestres y excluyendo el actual...');
    
    // Obtener todos los semestres y el semestre actual en paralelo
    forkJoin({
      allSemesters: this.semesterService.getAllSemesters(),
      currentSemester: this.semesterService.getCurrentSemester()
    }).subscribe({
      next: ({ allSemesters, currentSemester }) => {
        console.log('📋 Todos los semestres:', allSemesters);
        console.log('� Semestre actual:', currentSemester);
        
        // Filtrar para excluir el semestre actual
        const pastSemesters = allSemesters.filter(semester => 
          semester.id !== currentSemester.id
        );
        
        console.log('🔍 Semestres pasados (excluyendo actual):', pastSemesters);
        
        // Convertir los semestres al formato esperado por el componente
        this.availableSemesters = pastSemesters.map(semester => {
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
        console.error('❌ Error cargando semestres disponibles:', error);
        // Fallback: intentar usar solo getPastSemesters de planning service
        console.log('⚠️ Intentando fallback con getPastSemesters...');
        this.planningService.getPastSemesters().subscribe({
          next: (semesters) => {
            this.availableSemesters = semesters.map(semester => {
              const label = `${semester.year}-${semester.period.toString().padStart(2, '0')}`;
              this.semesterIdMap[label] = semester.id;
              return label;
            });
            console.log('📊 Semestres cargados desde fallback:', this.availableSemesters);
          },
          error: (fallbackError) => {
            console.error('❌ Error en fallback:', fallbackError);
          }
        });
      }
    });
  }
  
  /**
   * Maneja el cambio de selección de semestre
   */
  onSemesterChange(): void {
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
    this.planningService.getClassesBySemester(semesterId).subscribe({
      next: async (classes) => {
        this.annualClassIds = [];
        this.annualCount = 0;
        if (classes && classes.length > 0) {
          await Promise.all(
            classes.map(async (cls) => {
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
    
    console.log(`📥 Obteniendo clases para semestre: ${this.selectedSemester} (ID: ${semesterId})`);
    
    // Usar el endpoint correcto: GET /planning/classes/semester/{semesterId}
    this.planningService.getClassesBySemester(semesterId).subscribe({
      next: async (classes) => {
        console.log('✅ Clases recibidas del semestre:', classes);
        this.annualClassIds = [];
        this.showAnnualWarning = false;
        
        if (classes && classes.length > 0) {
          // Enriquecer clases con nombres de cursos desde el mapa
          const enrichedClasses = classes.map(cls => ({
            ...cls,
            courseName: cls.courseName || this.courseNameMap[cls.courseId] || 'Curso sin nombre'
          }));
          
          console.log('📚 Clases enriquecidas con nombres de cursos:', enrichedClasses);
          
          // Inicializar arrays
          this.annualClassIds = [];
          this.selectedClassIds = [];
          
          // Verificar cuáles son materias anuales (isValid === false)
          await Promise.all(
            enrichedClasses.map(async (cls) => {
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
          
          // Crear estructura de preview compatible con clases enriquecidas
          this.previewData = {
            totalClasses: enrichedClasses.length,
            semesterId: semesterId,
            classes: enrichedClasses
          };
          
          this.hasClassesInPreview = true;
          this.previewMessage = `Se encontraron ${enrichedClasses.length} clase(s) planificada(s) para ${this.selectedSemester}`;
        } else {
          // No hay clases
          this.previewData = {
            totalClasses: 0,
            semesterId: semesterId,
            classes: []
          };
          this.hasClassesInPreview = false;
          this.previewMessage = `❌ No hay clases planificadas para el semestre ${this.selectedSemester}`;
        }
        
        this.showPreview = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error obteniendo clases del semestre:', error);
        this.error = `Error al obtener las clases del semestre ${this.selectedSemester}`;
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

