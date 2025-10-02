import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { PlanningRow } from '../../models/planificacion.models';
import { PlanningClassesTable } from "../../components/planning-classes-table/planning-classes-table";
import { SelectedTeachers } from '../../services/selected-teachers';
import { ScheduleConflict } from '../../../docentes/components/schedule-conflict/schedule-conflict';

@Component({
  selector: 'app-planificacion-clases-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AccesosRapidosAdmi, AccesosRapidosSeccion, PlanningClassesTable, ScheduleConflict],
  templateUrl: './planificacion-page.html',
  styleUrls: ['./planificacion-page.scss'],
})
export class PlanificacionClasesPage implements OnInit, OnDestroy {
  // Simulación de rol; cámbialo cuando conectemos auth
  role: 'admin' | 'seccion' = 'admin'; // Vuelto a admin para mostrar todos los filtros

  // Propiedades para filtros
  searchText: string = '';
  materiaFilter: string = '';
  seccionFilter: string = '';
  
  // Propiedades para el modal de conflicto de horarios
  showScheduleConflict: boolean = false;
  conflictData = {
    teacherName: '',
    conflictSchedule: '',
    conflictSubject: '',
    newSchedule: '',
    newSubject: ''
  };
  
  // Datos filtrados y originales
  originalRows: PlanningRow[] = [];
  filteredRows: PlanningRow[] = [];
  
  private subscription: Subscription = new Subscription();

  constructor(private readonly selectedTeachersService: SelectedTeachers) {}

  // Datos mock (sin backend) - expandidos para mejor demostración de filtros
  rows: PlanningRow[] = [
    {
      _state: 'new',
      courseId: '1010',
      courseName: 'Redes',
      section: 'SIS-01',
      classId: '20134',
      seats: 20,
      startDate: '2025-07-21',
      endDate: '2025-11-21',
      weeks: 17,
      teacher: { id: 't1', name: 'Carlos Perez' },
      status: 'PENDIENTE',
      notes: [],
      schedules: [
        { day: 'LUN', startTime: '08:00', endTime: '10:00', disability: false, modality: 'PRESENCIAL', roomType: 'Aulas', room: '' },
      ],
    },
    {
      _state: 'existing',
      courseId: '1020',
      courseName: 'Base de Datos',
      section: 'SIS-02',
      classId: '20135',
      seats: 25,
      startDate: '2025-08-01',
      endDate: '2025-12-01',
      weeks: 17,
      teacher: { id: 't2', name: 'Ana Garcia' },
      status: 'CONFIRMADO',
      notes: [],
      schedules: [
        { day: 'MAR', startTime: '10:00', endTime: '12:00', disability: false, modality: 'PRESENCIAL', roomType: 'Laboratorio', room: 'Lab-01' },
      ],
    },
    {
      _state: 'existing',
      courseId: '1030',
      courseName: 'Algoritmos',
      section: 'ING-01',
      classId: '20136',
      seats: 30,
      startDate: '2025-07-28',
      endDate: '2025-11-28',
      weeks: 17,
      teacher: { id: 't3', name: 'Luis Rodriguez' },
      status: 'PENDIENTE',
      notes: [],
      schedules: [
        { day: 'MIE', startTime: '14:00', endTime: '16:00', disability: false, modality: 'PRESENCIAL', roomType: 'Aulas', room: '' },
      ],
    },
    {
      _state: 'existing',
      courseId: '1040',
      courseName: 'Programación Web',
      section: 'ING-02',
      classId: '20137',
      seats: 20,
      startDate: '2025-08-05',
      endDate: '2025-12-05',
      weeks: 17,
      teacher: { id: 't4', name: 'Maria Lopez' },
      status: 'CONFIRMADO',
      notes: [],
      schedules: [
        { day: 'JUE', startTime: '16:00', endTime: '18:00', disability: false, modality: 'VIRTUAL', roomType: 'Aulas', room: 'Zoom-01' },
      ],
    },
    {
      _state: 'existing',
      courseId: '1050',
      courseName: 'Inteligencia Artificial',
      section: 'SIS-03',
      classId: '20138',
      seats: 15,
      startDate: '2025-07-15',
      endDate: '2025-11-15',
      weeks: 17,
      status: 'PENDIENTE',
      notes: [],
      schedules: [
        { day: 'VIE', startTime: '08:00', endTime: '10:00', disability: false, modality: 'PRESENCIAL', roomType: 'Laboratorio', room: 'Lab-IA' },
      ],
    },
  ];

  ngOnInit() {
    // Inicializar datos de filtros
    this.originalRows = [...this.rows];
    this.filteredRows = [...this.rows];
    
    // Aplicar filtro por rol (si es sección, solo mostrar esa sección específica)
    if (this.role === 'seccion') {
      // En un caso real, obtendrías la sección del usuario autenticado
      const userSection = 'SIS'; // Simulación: usuario de sección SIS
      this.filteredRows = this.originalRows.filter(row => 
        row.section?.startsWith(userSection) ?? false
      );
      this.rows = [...this.filteredRows];
    }
    
    // Asegurar que siempre haya una fila editable al iniciar
    this.ensureEditableRow();
    
    // Suscribirse a los cambios en los docentes seleccionados
    this.subscription.add(
      this.selectedTeachersService.selectedTeachers$.subscribe(selectedTeachersMap => {
        console.log('Cambio en selected teachers:', selectedTeachersMap);
        this.updateRowsWithSelectedTeachers(selectedTeachersMap);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Getters para opciones de filtros
  get availableMaterias(): string[] {
    const materias = this.originalRows
      .map(row => row.courseName)
      .filter((materia): materia is string => !!materia)
      .filter((materia, index, arr) => arr.indexOf(materia) === index)
      .sort();
    return materias;
  }

  get availableSecciones(): string[] {
    if (this.role !== 'admin') return [];
    
    const secciones = this.originalRows
      .map(row => row.section)
      .filter((seccion): seccion is string => !!seccion)
      .filter((seccion, index, arr) => arr.indexOf(seccion) === index)
      .sort();
    return secciones;
  }

  // Método para aplicar filtros
  applyFilters() {
    let filtered = [...this.originalRows];

    // Filtro por rol (sección)
    if (this.role === 'seccion') {
      const userSection = 'SIS'; // En producción vendría del usuario autenticado
      filtered = filtered.filter(row => 
        row.section?.startsWith(userSection) ?? false
      );
    }

    // Filtro por búsqueda de texto
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(row => 
        row.courseName?.toLowerCase().includes(searchLower) ||
        row.courseId?.toLowerCase().includes(searchLower) ||
        row.teacher?.name?.toLowerCase().includes(searchLower) ||
        row.section?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por materia
    if (this.materiaFilter) {
      filtered = filtered.filter(row => row.courseName === this.materiaFilter);
    }

    // Filtro por sección (solo para admin)
    if (this.seccionFilter && this.role === 'admin') {
      filtered = filtered.filter(row => row.section === this.seccionFilter);
    }

    this.rows = filtered;
    
    // Asegurar que siempre haya una fila editable
    this.ensureEditableRow();
  }

  private updateRowsWithSelectedTeachers(selectedTeachersMap: Map<string, any>) {
    console.log('Actualizando filas con docentes seleccionados:', selectedTeachersMap);
    
    // Iterar sobre cada selección de docentes
    selectedTeachersMap.forEach((selection, classKey) => {
      console.log('Procesando selección:', classKey, selection);
      
      if (selection.teachers && selection.teachers.length > 0) {
        let rowIndex = selection.rowIndex;
        
        // Si no tenemos rowIndex, intentar encontrar una fila disponible
        if (rowIndex === undefined) {
          rowIndex = this.rows.findIndex(row => !row.teacher || !row.teacher.name);
          if (rowIndex === -1) rowIndex = 0; // Usar primera fila como fallback
        }
        
        console.log('Row index determinado:', rowIndex);
        
        // Encontrar la fila específica por índice
        if (rowIndex !== undefined && this.rows[rowIndex]) {
          this.rows[rowIndex].teacher = {
            id: selection.teachers[0].id || `teacher-${Date.now()}`,
            name: selection.teachers.map((t: any) => t.name).join(', ')
          };
          
          console.log('Docente asignado a fila', rowIndex, ':', this.rows[rowIndex].teacher);
          
          // Limpiar la selección después de usarla para evitar actualizaciones repetidas
          this.selectedTeachersService.clearSelectedTeachers(classKey);
        } else {
          console.log('No se pudo encontrar la fila con índice:', rowIndex);
        }
      } else {
        console.log('Selección no válida');
      }
    });
  }

  private ensureEditableRow() {
    // Solo agregar una fila nueva si NO hay filas en absoluto
    if (this.rows.length === 0) {
      this.addNewEditableRow();
    }
    // No agregamos fila automáticamente si ya hay filas existentes
  }

  private addNewEditableRow() {
    const newRow: PlanningRow = {
      _state: 'new',
      courseId: '',
      courseName: '',
      section: '',
      classId: '',
      seats: 0,
      startDate: '',
      endDate: '',
      weeks: 0,
      teacher: undefined,
      status: 'PENDIENTE',
      notes: [],
      schedules: [],
      _editing: true // Nueva fila siempre en modo edición
    };
    this.rows.push(newRow);
  }

  // Botones superiores (sin acción aún)
  planAnterior() {}
  aplicarPlaneacion() {}

  onPatchRow(e: { index: number; data: Partial<PlanningRow> }) {
    Object.assign(this.rows[e.index], e.data);
  }
  
  onAddRow() {
    // Agregar una nueva fila en modo edición
    this.addNewEditableRow();
  }
  
  onRemoveRow(i: number) {
    this.rows = this.rows.filter((_, idx) => idx !== i);
    // Después de eliminar, asegurar que haya una fila editable
    this.ensureEditableRow();
  }

  // Guardar cambios (luego conectamos backend)
  guardar() { console.log('Guardar (mock)', this.rows); }

  // Métodos para el modal de conflicto de horarios
  showConflictModal(teacherName: string, conflictSchedule: string, conflictSubject: string, newSchedule: string, newSubject: string) {
    this.conflictData = {
      teacherName,
      conflictSchedule,
      conflictSubject,
      newSchedule,
      newSubject
    };
    this.showScheduleConflict = true;
  }

  onConflictModalClosed() {
    this.showScheduleConflict = false;
  }

  onAssignDifferentTeacher() {
    this.showScheduleConflict = false;
    // Aquí iría la lógica para abrir el modal de selección de profesores
    console.log('Abriendo modal para asignar otro profesor');
  }

  // Método de prueba para mostrar el modal
  testScheduleConflict() {
    this.showConflictModal(
      'Maria Sanchez',
      'Lunes 08:00 - 10:00',
      'Programación I',
      'Lunes 08:00 - 10:00',
      'Base de Datos'
    );
  }
}
