import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { Docente, convertTeacherDTOToDocente } from '../../models/docente.model';
import { TeacherService } from '../../services/teacher.service';
import { SelectedTeachersService } from '../../services/selected-teachers.service';
import { TeacherDatesService } from '../../services/teacher-dates.service';
import { TeacherDatesRequest, TeacherDatePopupData } from '../../models/teacher-dates.model';
import { DocenteCard } from "../../components/docente-card/docente-card";
import { TeacherSelectModal } from "../../components/teacher-select-modal/teacher-select-modal";
import { TeacherDatesModalComponent } from "../../components/teacher-dates-modal/teacher-dates-modal.component";
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-docentes-page',
  imports: [CommonModule, FormsModule, DocenteCard, TeacherSelectModal, TeacherDatesModalComponent, AccesosRapidosAdmi, AccesosRapidosSeccion, SidebarToggleButtonComponent, HeaderComponent],
  templateUrl: './docentes-page.html',
  styleUrls: ['./docentes-page.scss']
})
export class DocentesPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Simulación de rol (como en planificacion-page)
  role: 'admin' | 'seccion' = 'admin';
  
  searchText = '';
  semesterFilter = '';
  subjectFilter = '';
  
  // Loading states
  isLoading = false;
  loadError: string | null = null;
  
  // Modal state
  showModal = false;
  selectedDocenteInfo: Docente | null = null;
  
  // Teacher dates modal state
  showDatesModal = false;
  datePopupData: TeacherDatePopupData | null = null;
  selectedTeacherForDates: Docente | null = null;
  
  // Información del contexto de clase recibida del router
  classKey: string = '';
  classInfo: any = null;

  // Datos de docentes (ahora cargados desde el backend)
  docentes: Docente[] = [];
  filteredDocentes: Docente[] = [];

  constructor(
    private readonly router: Router,
    private readonly teacherService: TeacherService,
    private readonly selectedTeachersService: SelectedTeachersService,
    private readonly teacherDatesService: TeacherDatesService
  ) {
    // Obtener el estado del router si está disponible
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.classKey = navigation.extras.state['classKey'] || '';
      this.classInfo = navigation.extras.state['classInfo'] || null;
      console.log('🎯 Contexto de clase recibido:', { classKey: this.classKey, classInfo: this.classInfo });
      
      // Establecer el estado en el servicio de selección
      if (this.classKey) {
        this.selectedTeachersService.setSelectionState(this.classKey, this.classInfo);
      }
    } else {
      // Intentar obtener del servicio de selección
      const selectionState = this.selectedTeachersService.getSelectionState();
      if (selectionState) {
        this.classKey = selectionState.classKey;
        this.classInfo = selectionState.classInfo;
        console.log('🔄 Contexto recuperado del servicio:', { classKey: this.classKey, classInfo: this.classInfo });
      } else {
        // Fallback: usar valores predeterminados
        this.classKey = `default-class-${Date.now()}`;
        console.log('⚠️ No se recibió contexto, usando key por defecto:', this.classKey);
      }
    }
  }

  ngOnInit() {
    this.loadTeachers();
    
    // Verificar si ya hay un docente seleccionado para esta clase
    const selectedTeacher = this.selectedTeachersService.getSelectedTeacher(this.classKey);
    if (selectedTeacher) {
      console.log('📌 Docente ya seleccionado para esta clase:', selectedTeacher);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Opciones para los filtros (hardcodeadas por ahora)
  semesters = ['2024-1', '2024-2', '2025-1', '2025-2'];
  subjects = ['Redes', 'IA', 'Optimización', 'Algoritmos', 'Bases de Datos', 'Programación'];

  /**
   * Cargar todos los docentes desde el backend
   */
  loadTeachers() {
    this.isLoading = true;
    this.loadError = null;
    
    console.log('📚 Cargando docentes desde el backend...');
    
    this.teacherService.getAllTeachers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (teachers) => {
          console.log('✅ Docentes cargados exitosamente:', teachers);
          this.docentes = teachers.map(teacher => convertTeacherDTOToDocente(teacher));
          
          // Marcar el docente seleccionado si existe
          this.markSelectedTeacher();
          
          this.filteredDocentes = [...this.docentes];
          this.extractOptionsFromData();
        },
        error: (error) => {
          console.error('❌ Error cargando docentes:', error);
          this.loadError = 'Error al cargar los docentes. Por favor, inténtalo de nuevo.';
          // Fallback a datos mock en caso de error
          this.loadMockData();
        }
      });
  }

  /**
   * Extraer opciones dinámicas de los datos cargados
   */
  private extractOptionsFromData() {
    // Extraer semestres únicos
    const allSemesters = this.docentes
      .flatMap(docente => docente.semesters || [])
      .filter((semester, index, array) => array.indexOf(semester) === index)
      .sort();
    
    if (allSemesters.length > 0) {
      this.semesters = allSemesters;
    }

    // Extraer materias únicas
    const allSubjects = this.docentes
      .flatMap(docente => docente.subjects || [])
      .filter((subject, index, array) => array.indexOf(subject) === index)
      .sort();
    
    if (allSubjects.length > 0) {
      this.subjects = allSubjects;
    }
  }

  /**
   * Datos mock de fallback (temporales hasta que el backend esté listo)
   */
  private loadMockData() {
    console.log('⚠️ Usando datos mock como fallback');
    this.docentes = [
      {
        id: 1,
        name: 'Ana María',
        lastName: 'Gutiérrez Silva',
        email: 'ana.gutierrez@javeriana.edu.co',
        maxHours: 40,
        assignedHours: 12,
        availableHours: 28,
        contractType: 'Tiempo Completo',
        subjects: ['Redes', 'Optimización', 'Seguridad Informática'],
        selected: false,
        semesters: ['2024-1', '2024-2'],
        classes: [
          {
            materia: 'Redes de Computadores',
            seccion: 'SIS-01',
            semestre: '2024-01',
            horarios: ['Lunes 8:00-10:00', 'Miércoles 8:00-10:00'],
            numeroClases: 2
          }
        ],
        observaciones: ['Máster en Ciberseguridad', 'Especialista en Redes']
      },
      {
        id: 2,
        name: 'Carlos Eduardo',
        lastName: 'Rodríguez Martínez',
        email: 'carlos.rodriguez@javeriana.edu.co',
        maxHours: 30,
        assignedHours: 18,
        availableHours: 12,
        contractType: 'Cátedra',
        subjects: ['Inteligencia Artificial', 'Machine Learning'],
        selected: false,
        semesters: ['2024-1', '2025-1'],
        classes: [
          {
            materia: 'IA Avanzada',
            seccion: 'SIS-04',
            semestre: '2024-01',
            horarios: ['Martes 10:00-12:00', 'Jueves 10:00-12:00'],
            numeroClases: 2
          }
        ],
        observaciones: ['PhD en Inteligencia Artificial', 'Investigador Senior']
      },
      {
        id: 3,
        name: 'María Elena',
        lastName: 'López Hernández',
        email: 'maria.lopez@javeriana.edu.co',
        maxHours: 35,
        assignedHours: 20,
        availableHours: 15,
        contractType: 'Tiempo Completo',
        subjects: ['Bases de Datos', 'Arquitectura de Software'],
        selected: false,
        semesters: ['2024-2', '2025-1'],
        classes: [
          {
            materia: 'Bases de Datos',
            seccion: 'SIS-06',
            semestre: '2024-02',
            horarios: ['Martes 9:00-12:00', 'Jueves 9:00-12:00'],
            numeroClases: 2
          }
        ],
        observaciones: ['DBA Certificada Oracle', 'Especialista en NoSQL']
      },
      {
        id: 4,
        name: 'Daniel Alejandro',
        lastName: 'Sánchez Castro',
        email: 'daniel.sanchez@javeriana.edu.co',
        maxHours: 25,
        assignedHours: 15,
        availableHours: 10,
        contractType: 'Cátedra',
        subjects: ['Algoritmos', 'Programación Avanzada'],
        selected: false,
        semesters: ['2024-2', '2025-1'],
        classes: [
          {
            materia: 'Algoritmos y Estructuras',
            seccion: 'ING-01',
            semestre: '2024-02',
            horarios: ['Viernes 8:00-11:00'],
            numeroClases: 1
          }
        ],
        observaciones: ['Especialista en Algoritmos', 'Competencias de Programación']
      },
      {
        id: 5,
        name: 'Sofia Valentina',
        lastName: 'Ramírez Torres',
        email: 'sofia.ramirez@javeriana.edu.co',
        maxHours: 20,
        assignedHours: 8,
        availableHours: 12,
        contractType: 'Cátedra',
        subjects: ['Desarrollo Web', 'Frontend Development'],
        selected: false,
        semesters: ['2024-1', '2024-2'],
        classes: [],
        observaciones: ['Full Stack Developer', 'Especialista en Angular']
      }
    ];
    this.filteredDocentes = [...this.docentes];
    this.markSelectedTeacher();
  }

  /**
   * Marcar el docente seleccionado en la lista
   */
  private markSelectedTeacher() {
    const selectedTeacher = this.selectedTeachersService.getSelectedTeacher(this.classKey);
    if (selectedTeacher) {
      // Buscar y marcar el docente en la lista
      this.docentes.forEach(docente => {
        docente.selected = docente.id === selectedTeacher.id || 
                          (docente.name === selectedTeacher.name && 
                           docente.lastName === selectedTeacher.lastName);
      });
      
      this.filteredDocentes.forEach(docente => {
        docente.selected = docente.id === selectedTeacher.id || 
                          (docente.name === selectedTeacher.name && 
                           docente.lastName === selectedTeacher.lastName);
      });
      
      console.log('✨ Docente seleccionado marcado en la lista');
    }
  }

  selectDocente(docente: Docente) {
    // Deseleccionar todos los docentes
    this.filteredDocentes.forEach(d => d.selected = false);
    this.docentes.forEach(d => d.selected = false);
    
    // Seleccionar el docente actual
    docente.selected = true;
    this.selectedDocenteInfo = docente;
    
    // Mostrar modal con información básica
    this.showModal = true;
  }

  filterDocentes() {
    this.filteredDocentes = this.docentes.filter(docente => {
      const matchesSearch = !this.searchText || 
        docente.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (docente.subjects || []).some(subject => 
          subject.toLowerCase().includes(this.searchText.toLowerCase())
        );
      
      const matchesSemester = !this.semesterFilter || 
        (docente.semesters || []).includes(this.semesterFilter);
      
      const matchesSubject = !this.subjectFilter || 
        (docente.subjects || []).includes(this.subjectFilter);
      
      return matchesSearch && matchesSemester && matchesSubject;
    });
  }
  
  closeModal() {
    this.showModal = false;
    this.selectedDocenteInfo = null;
  }

  onDocenteSelected(docente: Docente) {
    console.log('👨‍🏫 Docente seleccionado:', docente);
    
    // Cerrar el modal de selección
    this.closeModal();
    
    // Preparar datos para el modal de fechas
    this.selectedTeacherForDates = docente;
    this.datePopupData = {
      teacherClassId: 0, // Se asignará cuando se cree la relación
      teacherName: `${docente.name} ${docente.lastName || ''}`.trim(),
      className: this.classInfo?.courseName || 'Clase',
      semesterStartDate: this.getSemesterStartDate(), // Implementar método
      semesterEndDate: this.getSemesterEndDate(),     // Implementar método
      currentStartDate: undefined, // No hay fechas previas
      currentEndDate: undefined
    };
    
    // Mostrar modal de fechas
    this.showDatesModal = true;
  }

  onTeacherDatesSelected(dates: TeacherDatesRequest) {
    console.log('📅 Fechas seleccionadas:', dates);
    
    if (!this.selectedTeacherForDates) {
      console.error('❌ No hay docente seleccionado');
      return;
    }

    // Guardar la selección en el servicio con las fechas
    const teacherWithDates = {
      ...this.selectedTeacherForDates,
      startDate: dates.startDate,
      endDate: dates.endDate
    };
    
    this.selectedTeachersService.selectTeacher(this.classKey, teacherWithDates);
    
    // Cerrar modal de fechas
    this.closeDatesModal();
    
    // Navegar de regreso a la página de planificación con el contexto
    console.log('🔙 Navegando de regreso a planificación con fechas...');
    this.router.navigate(['/planificacion'], { 
      state: { 
        selectedTeacher: teacherWithDates,
        classKey: this.classKey,
        returnFromTeacherSelection: true
      } 
    });
  }

  closeDatesModal() {
    this.showDatesModal = false;
    this.datePopupData = null;
    this.selectedTeacherForDates = null;
  }

  private getSemesterStartDate(): string {
    // TODO: Obtener del servicio de semestres
    // Por ahora retornar fecha del semestre actual
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    if (currentMonth < 6) {
      // Primer semestre
      return `${currentYear}-01-15`;
    } else {
      // Segundo semestre
      return `${currentYear}-07-15`;
    }
  }

  private getSemesterEndDate(): string {
    // TODO: Obtener del servicio de semestres
    // Por ahora retornar fecha del semestre actual
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    if (currentMonth < 6) {
      // Primer semestre
      return `${currentYear}-05-30`;
    } else {
      // Segundo semestre
      return `${currentYear}-11-30`;
    }
  }
  
  // Método para manejar eventos de teclado del modal
  onModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  /**
   * Buscar docentes por término de búsqueda
   */
  searchTeachers() {
    if (!this.searchText.trim()) {
      this.filteredDocentes = [...this.docentes];
      return;
    }

    this.isLoading = true;
    
    this.teacherService.searchTeachers(this.searchText)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (teachers) => {
          console.log('🔍 Resultados de búsqueda:', teachers);
          this.filteredDocentes = teachers.map(teacher => convertTeacherDTOToDocente(teacher));
          this.markSelectedTeacher();
        },
        error: (error) => {
          console.error('❌ Error en búsqueda:', error);
          // Fallback a filtrado local
          this.filterDocentes();
        }
      });
  }

  /**
   * Filtrar docentes por criterios múltiples
   */
  applyFilters() {
    // Usar filtrado local ya que el backend no tiene estos endpoints
    this.filterDocentes();
  }

  /**
   * Recargar docentes
   */
  reloadTeachers() {
    this.loadTeachers();
  }
}


