import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Docente } from '../../models/docente.model';
import { DocenteCard } from "../docente-card/docente-card";
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';

@Component({
  selector: 'app-docentes-page',
  imports: [CommonModule, FormsModule, DocenteCard, AccesosRapidosAdmi, AccesosRapidosSeccion],
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
  
  // Opciones para los filtros (simulando backend)
  semesters = ['2024-1', '2024-2', '2025-1', '2025-2'];
  subjects = ['Redes', 'IA', 'Optimización', 'Algoritmos', 'Bases de Datos', 'Programación'];
  
  // Datos mock (simulando backend) con más docentes
  docentes: Docente[] = [
    { 
      name: 'Ana Maria Gutierrez', 
      subjects: ['Redes', 'Optimización'], 
      selected: false, 
      semesters: ['2024-1', '2024-2'] 
    },
    { 
      name: 'Sofia Gutierrez', 
      subjects: ['Redes', 'IA'], 
      selected: false, 
      semesters: ['2024-1', '2025-1'] 
    },
    { 
      name: 'Daniel Sanchez', 
      subjects: ['Redes', 'Optimización'], 
      selected: false, 
      semesters: ['2024-2', '2025-1'] 
    },
    { 
      name: 'Carlos Rodriguez', 
      subjects: ['Algoritmos', 'Programación'], 
      selected: false, 
      semesters: ['2024-1', '2025-1'] 
    },
    { 
      name: 'Maria Elena Lopez', 
      subjects: ['Bases de Datos', 'IA'], 
      selected: false, 
      semesters: ['2024-2', '2025-2'] 
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
  
  // Método para manejar eventos de teclado del modal
  onModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}


