import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TeacherDatesRequest, TeacherClassWithDates } from '../models/teacher-dates.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherDatesService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Actualiza las fechas de inicio y fin para una asignación profesor-clase específica
   * @param teacherClassId ID de la asignación profesor-clase
   * @param dates Fechas de inicio y fin
   * @returns Observable con la asignación actualizada
   */
  updateTeachingDates(teacherClassId: number, dates: TeacherDatesRequest): Observable<TeacherClassWithDates> {
    return this.http.patch<TeacherClassWithDates>(
      `${this.baseUrl}/teachers/classes/${teacherClassId}/dates`, 
      dates
    );
  }

  /**
   * Obtiene todas las asignaciones profesor-clase para una clase específica
   * @param classId ID de la clase
   * @returns Observable con la lista de asignaciones
   */
  getTeacherClassesByClassId(classId: number): Observable<TeacherClassWithDates[]> {
    return this.http.get<TeacherClassWithDates[]>(
      `${this.baseUrl}/teachers/classes/class/${classId}`
    );
  }

  /**
   * Obtiene la asignación profesor-clase específica por teacherId y classId
   * @param teacherId ID del profesor
   * @param classId ID de la clase
   * @returns Observable con la asignación específica
   */
  getTeacherClassByTeacherAndClass(teacherId: number, classId: number): Observable<TeacherClassWithDates> {
    return this.http.get<TeacherClassWithDates>(
      `${this.baseUrl}/teachers/${teacherId}/classes/${classId}`
    );
  }

  /**
   * Valida que las fechas estén dentro del rango del semestre
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param semesterStartDate Fecha de inicio del semestre
   * @param semesterEndDate Fecha de fin del semestre
   * @returns true si las fechas son válidas
   */
  validateDates(startDate: string, endDate: string, semesterStartDate: string, semesterEndDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const semStart = new Date(semesterStartDate);
    const semEnd = new Date(semesterEndDate);

    // Verificar que las fechas sean válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    // Verificar que la fecha de fin sea posterior a la de inicio
    if (end <= start) {
      return false;
    }

    // Verificar que las fechas estén dentro del rango del semestre
    if (start < semStart || end > semEnd) {
      return false;
    }

    return true;
  }

  /**
   * Formatea una fecha para mostrar en la interfaz
   * @param dateString Fecha en formato ISO (YYYY-MM-DD)
   * @returns Fecha formateada
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // Verificar formato YYYY-MM-DD
    const regex = /^(\d{4})-(\d{2})-(\d{2})/;
    const match = regex.exec(dateString);
    if (!match) return dateString; // Si no es formato esperado, devolver tal cual
    
    // Extraer año, mes, día sin crear objeto Date (evita problemas de timezone)
    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const day = Number.parseInt(match[3], 10);
    
    // Crear Date usando componentes locales (año, mes-1, día)
    // Esto evita la conversión UTC que causa el desplazamiento de un día
    const date = new Date(year, month - 1, day);
    
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}