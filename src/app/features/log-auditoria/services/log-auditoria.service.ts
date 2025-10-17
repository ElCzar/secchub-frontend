import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LogEntry } from '../pages/log-auditoria-page/log-auditoria-page';

/**
 * Servicio simulado para el Log de Auditoría
 * NOTA: Este servicio es temporal y será reemplazado por la conexión real al backend
 */
@Injectable({
  providedIn: 'root'
})
export class LogAuditoriaService {

  constructor() { }

  /**
   * Obtiene todas las entradas del log de auditoría (simulado)
   * @returns Observable con las entradas del log
   */
  getAllLogEntries(): Observable<LogEntry[]> {
    const mockData: LogEntry[] = [
      {
        id: 1,
        usuario: 'Edgar Enrique',
        accion: 'Editó clase',
        descripcion: 'Redes (SIS-01)',
        fecha: '05/08/2025',
        hora: '2:00pm'
      },
      {
        id: 2,
        usuario: 'Diana',
        accion: 'Registro usuario',
        descripcion: 'jefe_sis03@javeriana',
        fecha: '07/08/2025',
        hora: '4:00pm'
      },
      {
        id: 3,
        usuario: 'Maria Rodriguez',
        accion: 'Creó materia',
        descripcion: 'Algoritmos (SIS-02)',
        fecha: '08/08/2025',
        hora: '9:30am'
      },
      {
        id: 4,
        usuario: 'Carlos Mendez',
        accion: 'Eliminó usuario',
        descripcion: 'monitor01@javeriana',
        fecha: '09/08/2025',
        hora: '11:15am'
      },
      {
        id: 5,
        usuario: 'Ana Lopez',
        accion: 'Modificó horario',
        descripcion: 'Base de Datos (SIS-03)',
        fecha: '10/08/2025',
        hora: '3:45pm'
      },
      {
        id: 6,
        usuario: 'Pedro García',
        accion: 'Creó usuario',
        descripcion: 'estudiante_nuevo@javeriana',
        fecha: '11/08/2025',
        hora: '10:20am'
      },
      {
        id: 7,
        usuario: 'Laura Martinez',
        accion: 'Eliminó materia',
        descripcion: 'Cálculo I (MAT-01)',
        fecha: '12/08/2025',
        hora: '1:15pm'
      },
      {
        id: 8,
        usuario: 'Diego Silva',
        accion: 'Actualizó perfil',
        descripcion: 'Información personal',
        fecha: '13/08/2025',
        hora: '8:45am'
      },
      {
        id: 9,
        usuario: 'Sofia Ramirez',
        accion: 'Generó reporte',
        descripcion: 'Reporte de asistencia mensual',
        fecha: '14/08/2025',
        hora: '4:30pm'
      },
      {
        id: 10,
        usuario: 'Roberto Herrera',
        accion: 'Cambió contraseña',
        descripcion: 'Actualización de seguridad',
        fecha: '15/08/2025',
        hora: '11:50am'
      }
    ];

    // Simular delay de red
    return of(mockData).pipe(delay(500));
  }

  /**
   * Busca entradas por término de búsqueda (simulado)
   * @param searchTerm Término de búsqueda
   * @returns Observable con las entradas filtradas
   */
  searchLogEntries(searchTerm: string): Observable<LogEntry[]> {
    return this.getAllLogEntries().pipe(
      delay(300) // Simular búsqueda
    );
  }

  /**
   * Filtra entradas por usuario (simulado)
   * @param usuario Nombre del usuario
   * @returns Observable con las entradas del usuario
   */
  getLogEntriesByUser(usuario: string): Observable<LogEntry[]> {
    return this.getAllLogEntries().pipe(
      delay(300) // Simular filtrado
    );
  }

  /**
   * Filtra entradas por rango de fechas (simulado)
   * @param fechaInicio Fecha de inicio
   * @param fechaFin Fecha de fin
   * @returns Observable con las entradas en el rango
   */
  getLogEntriesByDateRange(fechaInicio: string, fechaFin: string): Observable<LogEntry[]> {
    return this.getAllLogEntries().pipe(
      delay(400) // Simular filtrado por fecha
    );
  }

  /**
   * Obtiene la lista de usuarios únicos (simulado)
   * @returns Observable con la lista de usuarios
   */
  getUniqueUsers(): Observable<string[]> {
    const users = [
      'Edgar Enrique',
      'Diana',
      'Maria Rodriguez',
      'Carlos Mendez',
      'Ana Lopez',
      'Pedro García',
      'Laura Martinez',
      'Diego Silva',
      'Sofia Ramirez',
      'Roberto Herrera'
    ];

    return of(users).pipe(delay(200));
  }
}