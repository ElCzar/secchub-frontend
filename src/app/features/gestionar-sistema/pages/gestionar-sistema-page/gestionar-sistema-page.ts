import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarToggleButtonComponent } from "../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button";
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";
import { SubjectsTable } from '../../components/subjects-table/subjects-table';
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';

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

  // Información de planificación
  selectedSemestre = '';
  fechaInicioPlanificacion = '';
  fechaFinPlanificacion = '';
  availableSemestres = [
    { id: '2024-1', name: '2024-1' },
    { id: '2024-2', name: '2024-2' },
    { id: '2025-1', name: '2025-1' },
    { id: '2025-2', name: '2025-2' }
  ];

  constructor(
    private readonly courseInformationService: CourseInformationService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
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
    const secciones = this.courses
      .map(course => course.semesterName)
      .filter(Boolean)
      .filter((seccion, index, array) => array.indexOf(seccion) === index);
    
    this.availableSecciones = secciones as string[];
  }

  applyFilters(): void {
    let filtered = [...this.courses];

    // Filtro de búsqueda por texto
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por sección
    if (this.seccionFilter) {
      filtered = filtered.filter(course => course.semesterName === this.seccionFilter);
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
    const mockCourse: CourseResponseDTO = {
      id: Date.now(), // ID temporal
      name: newCourseData.name,
      code: newCourseData.code,
      credits: newCourseData.credits,
      description: newCourseData.description,
      semesterId: 1, // Temporal
      semesterName: newCourseData.section
    };
    
    this.courses.push(mockCourse);
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
}
