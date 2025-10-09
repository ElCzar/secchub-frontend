import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Monitor } from '../models/monitor.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitudMonitoresService {
  private readonly baseUrl = 'http://localhost:8080/admin-resources/monitores';

  constructor(private readonly http: HttpClient) {}

  getMonitores(): Observable<Monitor[]> {
    // Datos de prueba temporales - reemplazar con llamada HTTP real
    const mockData: Monitor[] = [
      {
        id: '121432101025',
        nombre: 'Juan',
        apellido: 'Paez',
        carrera: 'Ing. Sistema',
        semestre: 5,
        promedio: 4.0,
        profesor: 'Edgar Enrique Ruiz',
        noClase: 0,
        asignatura: 'Redes',
        nota: 4.7,
        horasSemanales: 3,
        semanas: 16,
        totalHoras: 48,
        correo: 'juan@javeriana.edu.co',
        antiguo: true,
        administrativo: true,
        seleccionado: false,
        showHorarios: false,
        editing: false,
        horarios: [
          {
            dia: 'Martes',
            horaInicio: '8:00am',
            horaFinal: '1:00pm',
            totalHoras: 5
          }
        ]
      },
      {
        id: '121432101026',
        nombre: 'María',
        apellido: 'González',
        carrera: 'Ing. Industrial',
        semestre: 7,
        promedio: 4.3,
        profesor: 'Ana María Castro',
        noClase: 1,
        asignatura: 'Estadística',
        nota: 4.2,
        horasSemanales: 4,
        semanas: 16,
        totalHoras: 64,
        correo: 'maria.gonzalez@javeriana.edu.co',
        antiguo: false,
        administrativo: false,
        seleccionado: false,
        showHorarios: false,
        editing: false,
        horarios: [
          {
            dia: 'Lunes',
            horaInicio: '10:00am',
            horaFinal: '12:00pm',
            totalHoras: 2
          },
          {
            dia: 'Miércoles',
            horaInicio: '2:00pm',
            horaFinal: '4:00pm',
            totalHoras: 2
          }
        ]
      }
    ];

    return of(mockData);
    
    // Descomenta para usar la llamada HTTP real:
    // return this.http.get<Monitor[]>(`${this.baseUrl}/listar`);
  }

  updateMonitores(monitores: Monitor[]): Observable<void> {
    console.log('Guardando monitores:', monitores);
    
    // Simular guardado exitoso - reemplazar con llamada HTTP real
    return of(void 0);
    
    // Descomenta para usar la llamada HTTP real:
    // return this.http.put<void>(`${this.baseUrl}/actualizar`, monitores);
  }
}
