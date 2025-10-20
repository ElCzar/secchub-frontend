import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuditLogResponseDTO } from '../../../shared/model/dto/log/AuditLogResponseDTO.model';
import { environment } from '../../../../environments/environment';

/**
 * Servicio para manejar las operaciones relacionadas con el log de auditoría.
 */
@Injectable({
  providedIn: 'root'
})
export class LogAuditoriaService {
  private readonly baseUrl = environment.apiUrl + '/audit-logs';


  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene las entradas del log de auditoría con paginación y filtros mediante streaming NDJSON
   * @param page Número de página (0-indexed)
   * @param size Cantidad de entradas por página
   * @param action Filtro por acción (opcional)
   * @param date Filtro por fecha en formato dd/MM/yyyy (opcional)
   * @returns Observable con las entradas del log
   */
  getLogEntries(
    page: number = 0, 
    size: number = 50, 
    action?: string, 
    date?: string
  ): Observable<AuditLogResponseDTO[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (action) {
      params = params.set('action', action);
    }

    if (date) {
      params = params.set('date', date);
    }

    // Request as text to handle NDJSON manually
    return this.http.get(this.baseUrl, { 
      params,
      headers: {
        'Accept': 'application/x-ndjson'
      },
      responseType: 'text'
    }).pipe(
      map((ndjsonText: string) => this.parseNDJSON(ndjsonText))
    );
  }

  /**
   * Obtiene todas las entradas del log de auditoría (sin paginación, streaming completo)
   * @returns Observable con todas las entradas del log
   */
  getAllLogEntries(): Observable<AuditLogResponseDTO[]> {
    return this.http.get(this.baseUrl, {
      headers: {
        'Accept': 'application/x-ndjson'
      },
      responseType: 'text'
    }).pipe(
      map((ndjsonText: string) => this.parseNDJSON(ndjsonText))
    );
  }

  /**
   * Obtiene las entradas del log de auditoría para un email específico mediante streaming NDJSON
   * @param email Email del usuario
   * @returns Observable con las entradas del log para el usuario
   */
  getLogEntriesByEmail(email: string): Observable<AuditLogResponseDTO[]> {
    return this.http.get(`${this.baseUrl}/email/${email}`, {
      headers: {
        'Accept': 'application/x-ndjson'
      },
      responseType: 'text'
    }).pipe(
      map((ndjsonText: string) => this.parseNDJSON(ndjsonText))
    );
  }

  /**
   * Obtiene las entradas del log de auditoría para una acción específica mediante streaming NDJSON
   * @param action Tipo de acción (CREATE, UPDATE, DELETE)
   * @returns Observable con las entradas del log para la acción
   */
  getLogEntriesByAction(action: string): Observable<AuditLogResponseDTO[]> {
    return this.http.get(`${this.baseUrl}/action/${action}`, {
      headers: {
        'Accept': 'application/x-ndjson'
      },
      responseType: 'text'
    }).pipe(
      map((ndjsonText: string) => this.parseNDJSON(ndjsonText))
    );
  }

  /**
   * Obtiene las entradas del log de auditoría para un email y acción específicos mediante streaming NDJSON
   * @param email Email del usuario
   * @param action Tipo de acción (CREATE, UPDATE, DELETE)
   * @returns Observable con las entradas del log
   */
  getLogEntriesByEmailAndAction(email: string, action: string): Observable<AuditLogResponseDTO[]> {
    return this.http.get(`${this.baseUrl}/email/${email}/action/${action}`, {
      headers: {
        'Accept': 'application/x-ndjson'
      },
      responseType: 'text'
    }).pipe(
      map((ndjsonText: string) => this.parseNDJSON(ndjsonText))
    );
  }

  /**
   * Parse NDJSON (newline-delimited JSON) text into array of objects
   * @param ndjsonText NDJSON formatted string
   * @returns Array of parsed AuditLogResponseDTO objects
   */
  private parseNDJSON(ndjsonText: string): AuditLogResponseDTO[] {
    if (!ndjsonText || ndjsonText.trim() === '') {
      return [];
    }

    return ndjsonText
      .trim()
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          return JSON.parse(line) as AuditLogResponseDTO;
        } catch (error) {
          console.error('Error parsing NDJSON line:', line, error);
          return null;
        }
      })
      .filter((entry): entry is AuditLogResponseDTO => entry !== null);
  }
}