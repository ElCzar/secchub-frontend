import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Docente } from '../models/docente.model';

export interface TeacherSelectionState {
  classKey: string;
  classInfo: any;
  selectedTeacher: Docente | null;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SelectedTeachersService {
  private selectedTeachersSubject = new BehaviorSubject<Map<string, Docente>>(new Map());
  private selectionStateSubject = new BehaviorSubject<TeacherSelectionState | null>(null);

  // Observable para que otros componentes se suscriban a los cambios
  selectedTeachers$ = this.selectedTeachersSubject.asObservable();
  selectionState$ = this.selectionStateSubject.asObservable();

  constructor() {
    console.log('🏭 SelectedTeachersService inicializado');
  }

  /**
   * Seleccionar un docente para una clase específica
   */
  selectTeacher(classKey: string, teacher: Docente): void {
    const currentTeachers = this.selectedTeachersSubject.value;
    const updatedTeachers = new Map(currentTeachers);
    
    // Marcar el docente como seleccionado
    const selectedTeacher = { ...teacher, selected: true };
    updatedTeachers.set(classKey, selectedTeacher);
    
    console.log(`👨‍🏫 Docente seleccionado para clase ${classKey}:`, selectedTeacher);
    
    this.selectedTeachersSubject.next(updatedTeachers);
  }

  /**
   * Obtener el docente seleccionado para una clase específica
   */
  getSelectedTeacher(classKey: string): Docente | null {
    return this.selectedTeachersSubject.value.get(classKey) || null;
  }

  /**
   * Obtener todos los docentes seleccionados
   */
  getAllSelectedTeachers(): Map<string, Docente> {
    return new Map(this.selectedTeachersSubject.value);
  }

  /**
   * Remover la selección de docente para una clase
   */
  removeTeacherSelection(classKey: string): void {
    const currentTeachers = this.selectedTeachersSubject.value;
    const updatedTeachers = new Map(currentTeachers);
    
    updatedTeachers.delete(classKey);
    
    console.log(`🗑️ Selección de docente removida para clase ${classKey}`);
    
    this.selectedTeachersSubject.next(updatedTeachers);
  }

  /**
   * Limpiar todas las selecciones
   */
  clearAllSelections(): void {
    console.log('🧹 Limpiando todas las selecciones de docentes');
    this.selectedTeachersSubject.next(new Map());
    this.selectionStateSubject.next(null);
  }

  /**
   * Establecer el estado de selección para navegación
   */
  setSelectionState(classKey: string, classInfo: any): void {
    const state: TeacherSelectionState = {
      classKey,
      classInfo,
      selectedTeacher: this.getSelectedTeacher(classKey),
      timestamp: Date.now()
    };
    
    console.log('📋 Estado de selección establecido:', state);
    this.selectionStateSubject.next(state);
  }

  /**
   * Obtener el estado actual de selección
   */
  getSelectionState(): TeacherSelectionState | null {
    return this.selectionStateSubject.value;
  }

  /**
   * Limpiar el estado de selección
   */
  clearSelectionState(): void {
    this.selectionStateSubject.next(null);
  }

  /**
   * Verificar si hay un docente seleccionado para una clase
   */
  hasSelectedTeacher(classKey: string): boolean {
    return this.selectedTeachersSubject.value.has(classKey);
  }

  /**
   * Obtener el nombre del docente seleccionado para mostrar en la interfaz
   */
  getSelectedTeacherName(classKey: string): string {
    const teacher = this.getSelectedTeacher(classKey);
    if (teacher) {
      return teacher.lastName ? `${teacher.name} ${teacher.lastName}` : teacher.name;
    }
    return '';
  }

  /**
   * Contar el total de docentes seleccionados
   */
  getSelectedTeachersCount(): number {
    return this.selectedTeachersSubject.value.size;
  }

  /**
   * Obtener estadísticas de selección
   */
  getSelectionStats(): {
    totalSelected: number;
    classesWithTeachers: string[];
    lastSelectionTime: number | null;
  } {
    const selectedTeachers = this.selectedTeachersSubject.value;
    const state = this.selectionStateSubject.value;
    
    return {
      totalSelected: selectedTeachers.size,
      classesWithTeachers: Array.from(selectedTeachers.keys()),
      lastSelectionTime: state?.timestamp || null
    };
  }
}
