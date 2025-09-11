import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Docente } from '../../docentes/models/docente.model';

interface SelectedTeacherData {
  classId?: number;
  seccion?: string;
  materia?: string;
  rowIndex?: number;
  teachers: Docente[];
}

@Injectable({
  providedIn: 'root'
})
export class SelectedTeachers {
  private readonly selectedTeachersSubject = new BehaviorSubject<Map<string, SelectedTeacherData>>(new Map());
  public selectedTeachers$ = this.selectedTeachersSubject.asObservable();

  addSelectedTeachers(classKey: string, teachers: Docente[], classInfo?: { materia?: string; seccion?: string; classId?: number; rowIndex?: number }) {
    console.log('Agregando docentes seleccionados:', { classKey, teachers, classInfo });
    
    const currentMap = this.selectedTeachersSubject.value;
    const newMap = new Map(currentMap);
    
    newMap.set(classKey, {
      teachers,
      classId: classInfo?.classId,
      seccion: classInfo?.seccion,
      materia: classInfo?.materia,
      rowIndex: classInfo?.rowIndex
    });
    
    console.log('Nuevo mapa de docentes:', newMap);
    this.selectedTeachersSubject.next(newMap);
  }

  getSelectedTeachers(classKey: string): SelectedTeacherData | undefined {
    return this.selectedTeachersSubject.value.get(classKey);
  }

  getAllSelectedTeachers(): Map<string, SelectedTeacherData> {
    return this.selectedTeachersSubject.value;
  }

  clearSelectedTeachers(classKey?: string) {
    if (classKey) {
      const currentMap = this.selectedTeachersSubject.value;
      const newMap = new Map(currentMap);
      newMap.delete(classKey);
      this.selectedTeachersSubject.next(newMap);
    } else {
      this.selectedTeachersSubject.next(new Map());
    }
  }
}
