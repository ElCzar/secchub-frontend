import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Docente } from '../../models/docente.model';
import { DocenteCard } from "../../components/docente-card/docente-card";
import { TeacherSelectModal } from "../../components/teacher-select-modal/teacher-select-modal";
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';

@Component({
  selector: 'app-docentes-page',
  imports: [CommonModule, FormsModule, DocenteCard, TeacherSelectModal, AccesosRapidosAdmi, AccesosRapidosSeccion],
  templateUrl: './docentes-page.html',
  styleUrls: ['./docentes-page.scss']
})
export class DocentesPage {
  // Simulación de rol (como en planificacion-page)
  role: 'admin' | 'seccion' = 'admin';
  
  searchText = '';
  semesterFilter = '';
  subjectFilter = '';
  
  // Modal state
  showModal = false;
  selectedDocenteInfo: Docente | null = null;
  
  // Información del contexto de clase recibida del router
  classKey: string = '';
  classInfo: any = null;

  constructor(private readonly router: Router) {
    // Obtener el estado del router si está disponible
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.classKey = navigation.extras.state['classKey'] || '';
      this.classInfo = navigation.extras.state['classInfo'] || null;
      console.log('Contexto de clase recibido:', { classKey: this.classKey, classInfo: this.classInfo });
    } else {
      // Fallback: usar valores predeterminados
      this.classKey = `default-class-${Date.now()}`;
      console.log('No se recibió contexto, usando key por defecto:', this.classKey);
    }
  }
  
  // Opciones para los filtros (simulando backend)
  semesters = ['2024-1', '2024-2', '2025-1', '2025-2'];
  subjects = ['Redes', 'IA', 'Optimización', 'Algoritmos', 'Bases de Datos', 'Programación'];
  
  // Datos mock (simulando backend) con más docentes y clases detalladas
  docentes: Docente[] = [
    { 
      name: 'Ana Maria Gutierrez', 
      subjects: ['Redes', 'Optimización'], 
      selected: false, 
      semesters: ['2024-1', '2024-2'],
      classes: [
        {
          materia: 'Redes',
          seccion: 'SIS-01',
          semestre: '2024-01',
          horarios: ['Lu. Mi. 8-10am', 'Lu. Vi. 2-5pm'],
          numeroClases: 2
        },
        {
          materia: 'Intro IA',
          seccion: 'SIS-02',
          semestre: '2023-02',
          horarios: ['Lu. Vi. 2-5pm'],
          numeroClases: 1
        },
        {
          materia: 'BD',
          seccion: 'SIS-03',
          semestre: '2024-03',
          horarios: ['Lu. Vi. 2-5pm'],
          numeroClases: 1
        }
      ],
      observaciones: ['Máster en Ciberseguridad de Redes y Sistemas']
    },
    { 
      name: 'Sofia Gutierrez', 
      subjects: ['Redes', 'IA'], 
      selected: false, 
      semesters: ['2024-1', '2025-1'],
      classes: [
        {
          materia: 'IA Avanzada',
          seccion: 'SIS-04',
          semestre: '2024-01',
          horarios: ['Ma. Ju. 10-12am'],
          numeroClases: 2
        }
      ],
      observaciones: ['Especialista en Machine Learning', 'PhD en Inteligencia Artificial']
    },
    { 
      name: 'Daniel Sanchez', 
      subjects: ['Redes', 'Optimización'], 
      selected: false, 
      semesters: ['2024-2', '2025-1'],
      classes: [
        {
          materia: 'Optimización',
          seccion: 'ING-01',
          semestre: '2024-02',
          horarios: ['Vi. 8-11am'],
          numeroClases: 1
        }
      ],
      observaciones: []
    },
    { 
      name: 'Carlos Rodriguez', 
      subjects: ['Algoritmos', 'Programación'], 
      selected: false, 
      semesters: ['2024-1', '2025-1'],
      classes: [
        {
          materia: 'Algoritmos',
          seccion: 'SIS-05',
          semestre: '2024-01',
          horarios: ['Lu. Mi. Vi. 2-4pm'],
          numeroClases: 3
        }
      ],
      observaciones: ['Experto en Estructuras de Datos']
    },
    { 
      name: 'Maria Elena Lopez', 
      subjects: ['Bases de Datos', 'IA'], 
      selected: false, 
      semesters: ['2024-2', '2025-2'],
      classes: [
        {
          materia: 'Bases de Datos',
          seccion: 'SIS-06',
          semestre: '2024-02',
          horarios: ['Ma. Ju. 9-12am'],
          numeroClases: 2
        }
      ],
      observaciones: ['DBA Certificada Oracle', 'Especialista en NoSQL']
    }
  ];


  filteredDocentes = [...this.docentes];

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
        docente.subjects.some(subject => 
          subject.toLowerCase().includes(this.searchText.toLowerCase())
        );
      
      const matchesSemester = !this.semesterFilter || 
        docente.semesters?.includes(this.semesterFilter);
      
      const matchesSubject = !this.subjectFilter || 
        docente.subjects.includes(this.subjectFilter);
      
      return matchesSearch && matchesSemester && matchesSubject;
    });
  }
  
  closeModal() {
    this.showModal = false;
    this.selectedDocenteInfo = null;
  }

  onDocenteSelected(docente: Docente) {
    console.log('Docente seleccionado:', docente);
    // Aquí podrías emitir un evento al componente padre o guardar la selección
    // Por ahora solo cerramos el modal
    this.closeModal();
  }
  
  // Método para manejar eventos de teclado del modal
  onModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}


