import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarToggleButtonComponent } from "../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button";
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";
import { SubjectsTable } from '../../components/subjects-table/subjects-table';
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';
import { SectionInformationService } from '../../../../shared/services/section-information.service';
import { SectionResponseDTO } from '../../../registrar/models/section.models';
import { SemesterResponseDTO } from '../../../../shared/model/dto/admin/SemesterResponseDTO.model';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { ParametricService } from '../../../../shared/services/parametric.service';
import { StatusDTO } from '../../../../shared/model/dto/parametric';
import { SemesterChangeService } from '../../services/semester-change-service.service';
import { SemesterRequestDTO } from '../../../../shared/model/dto/admin/SemesterRequestDTO.model';

@Component({
  selector: 'app-gestionar-sistema-page',
  imports: [
    CommonModule, 
    FormsModule, 
    HeaderComponent, 
    SidebarToggleButtonComponent, 
    AccesosRapidosAdmi,
    SubjectsTable
  ],
  templateUrl: './gestionar-sistema-page.html',
  styleUrl: './gestionar-sistema-page.scss'
})
export class GestionarSistemaPage implements OnInit {
  @ViewChild('subjectsTable') subjectsTable!: SubjectsTable;
  
  // Datos de la tabla
  courses: CourseResponseDTO[] = [];
  filteredCourses: CourseResponseDTO[] = [];
  
  // Estado de carga
  loading = false;
  
  // Búsqueda y filtros
  searchTerm = '';
  seccionFilter = '';
  availableSecciones: string[] = [];
  sectionResponseDTO: SectionResponseDTO[] = [];
  statusResponseDTO: StatusDTO[] = [];

  // Información de planificación
  selectedSemestre = '';
  fechaInicioPlanificacion = '';
  fechaFinPlanificacion = '';
  availableSemestres: SemesterResponseDTO[] = [];

  // New Semester functionality
  isAddingNewSemester = false;
  newSemester = {
    period: 1,
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  };

  constructor(
    private readonly courseInformationService: CourseInformationService,
    private readonly sectionInformationService: SectionInformationService,
    private readonly semesterInformationService: SemesterInformationService,
    private readonly parametricService: ParametricService,
    private readonly semesterChangeService: SemesterChangeService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadSemesters();
    this.loadStatuses();
  }

  loadCourses(): void {
    this.loading = true;
    
    this.courseInformationService.findAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.extractAvailableSecciones();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }

  private extractAvailableSecciones(): void {
    this.sectionInformationService.findAllSections().subscribe({
      next: (sections) => {
        this.sectionResponseDTO = sections;
        this.availableSecciones = sections.map(section => section.name);
      },
      error: (error) => {
        console.error('Error loading sections:', error);
      }
    });
  }

  loadSemesters(): void {
    this.semesterInformationService.getAllSemesters().subscribe({
      next: (semesters) => {
        this.availableSemestres = semesters;
      },
      error: (error) => {
        console.error('Error loading semesters:', error);
      }
    });
  }

  loadStatuses(): void {
    this.parametricService.getAllStatuses().subscribe({
      next: (statuses) => {
        this.statusResponseDTO = statuses;
      },
      error: (error) => {
        console.error('Error loading statuses:', error)
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.courses];

    // Filtro de búsqueda por texto
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(searchLower) ||
        course.id?.toString().toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por sección
    if (this.seccionFilter) {
      filtered = filtered.filter(course => course.sectionId === this.sectionResponseDTO.find(sec => sec.name === this.seccionFilter)?.id);
    }

    this.filteredCourses = filtered;
  }

  onSearch(): void {
    this.applyFilters();
  }

  editCourse(course: CourseResponseDTO): void {
    console.log('Edit course:', course);
    // Implementar navegación o modal de edición
  }

  deleteCourse(course: CourseResponseDTO): void {
    console.log('Delete course:', course);
    // Por ahora solo log, después implementar eliminación
  }

  addNewCourse(): void {
    this.subjectsTable.startAddingNew();
  }

  saveNewCourse(newCourseData: any): void {
    console.log('Save new course:', newCourseData);
    // Aquí iría la lógica para guardar en el backend
    // Por ahora solo mostrar en consola
    
    // Simular agregar a la lista local (esto se haría desde el backend)
    const newCourse: CourseResponseDTO = {
      name: newCourseData.name,
      credits: newCourseData.credits,
      description: newCourseData.description,
      sectionId: newCourseData.section
    };
    
    this.courses.push(newCourse);
    this.applyFilters();
  }

  // Métodos para formulario de planificación
  isPlanningFormValid(): boolean {
    return !!(
      this.selectedSemestre && 
      this.fechaInicioPlanificacion && 
      this.fechaFinPlanificacion &&
      this.fechaInicioPlanificacion <= this.fechaFinPlanificacion
    );
  }

  onPlanningFormChange(): void {
    // Validar fechas
    if (this.fechaInicioPlanificacion && this.fechaFinPlanificacion) {
      if (this.fechaInicioPlanificacion > this.fechaFinPlanificacion) {
        console.warn('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }
    
    // Update dates when semester changes
    const selectedSemesterInfo = this.getSelectedSemester();
    if (selectedSemesterInfo) {
      this.fechaInicioPlanificacion = selectedSemesterInfo.startDate;
      this.fechaFinPlanificacion = selectedSemesterInfo.endDate;
    }
  }

  getSelectedSemester(): SemesterResponseDTO | null {
    if (!this.selectedSemestre) {
      return null;
    }
    return this.availableSemestres.find(sem => sem.id?.toString() === this.selectedSemestre) || null;
  }

  savePlanningInfo(): void {
    if (this.isPlanningFormValid()) {
      const planningData = {
        semestre: this.selectedSemestre,
        fechaInicio: this.fechaInicioPlanificacion,
        fechaFin: this.fechaFinPlanificacion
      };
      
      console.log('Guardando información de planificación:', planningData);
      // Aquí iría la llamada al backend para guardar la información de planificación
    } else {
      console.warn('Formulario de planificación incompleto o inválido');
    }
  }

  // New Semester methods
  startAddingNewSemester(): void {
    this.isAddingNewSemester = true;
    this.resetNewSemester();
  }

  cancelAddingNewSemester(): void {
    this.isAddingNewSemester = false;
    this.resetNewSemester();
  }

  saveNewSemester(): void {
    if (this.validateNewSemester()) {
      const semesterRequest: SemesterRequestDTO = this.semesterChangeService.createRequestDTO(this.newSemester);
      
      this.semesterChangeService.createSemester(semesterRequest).subscribe({
        next: (newSemester) => {
          console.log('Semester created successfully:', newSemester);
          this.availableSemestres.push(newSemester);
          this.isAddingNewSemester = false;
          this.resetNewSemester();
          alert('Semestre creado exitosamente');
        },
        error: (error) => {
          console.error('Error creating semester:', error);
          alert('Error al crear el semestre. Por favor, inténtelo de nuevo.');
        }
      });
    }
  }

  validateNewSemester(): boolean {
    return this.semesterChangeService.validateSemesterData(this.newSemester);
  }

  private resetNewSemester(): void {
    this.newSemester = {
      period: 1,
      year: new Date().getFullYear(),
      startDate: '',
      endDate: ''
    };
  }

  // Computed property to determine if semester form fields should be editable
  isSemesterFormEditable(): boolean {
    return this.isAddingNewSemester;
  }
}
