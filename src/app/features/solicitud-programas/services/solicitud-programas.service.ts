import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SolicitudDto {
  id: string | number;
  program: string;
  materia: string;
  cupos: number;
  startDate: string;
  endDate: string;
  comments?: string;
  // Optional schedules attached to the solicitud
  schedules?: Array<any>;
}

@Injectable({ providedIn: 'root' })
export class SolicitudProgramasService {
  constructor() {}

  // Mock: devuelve solicitudes asociadas a la sección del usuario
  getRequestsForSection(): Observable<SolicitudDto[]> {
    const mock: SolicitudDto[] = [
      {
        id: 1,
        program: 'Ingeniería de Sistemas',
        materia: 'Algoritmos',
        cupos: 30,
        startDate: '2025-02-01',
        endDate: '2025-06-30',
        comments: 'Profesor solicita aumento de cupos por alta demanda',
        schedules: [{ day: 'LUN', startTime: '08:00', endTime: '10:00', disability: false, modality: 'PRESENCIAL', roomType: 'Aulas' }]
      },
      {
        id: 2,
        program: 'Ingeniería de Sistemas',
        materia: 'Algoritmos',
        cupos: 25,
        startDate: '2025-02-01',
        endDate: '2025-06-30',
        comments: 'Solicita horario alterno por laboratorio ocupado',
        schedules: [{ day: 'MAR', startTime: '10:00', endTime: '12:00', disability: false, modality: 'PRESENCIAL', roomType: 'Laboratorio' }]
      },
      {
        id: 3,
        program: 'Ingeniería Electrónica',
        materia: 'Electrónica I',
        cupos: 20,
        startDate: '2025-02-01',
        endDate: '2025-06-30',
        comments: 'Clase práctica requiere material adicional',
        schedules: [{ day: 'MIE', startTime: '14:00', endTime: '16:00', disability: false, modality: 'PRESENCIAL', roomType: 'Aulas' }]
      }
    ];
    return of(mock);
  }

  applyRequests(payload: any): Observable<any> {
    console.log('Aplicando payload', payload);
    // Mock success
    return of({ ok: true });
  }
}
