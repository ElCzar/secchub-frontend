import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProgramaContextDto } from "../models/context.models";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";



export interface ProgramaRowDto {
  courseId: string;
  courseName: string;
  section: string;
  roomType: string;
  seats: number;
  startDate: string; // ISO
  endDate: string;   // ISO
  weeks: number;
}



@Injectable({ providedIn: 'root' })
export class ProgramasService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

   getContext(): Observable<ProgramaContextDto> {
    return this.http.get<ProgramaContextDto>(`${this.baseUrl}/api/programas/context`);
  }

  // Carga las clases guardadas en el semestre anterior para esta carrera/usuario
  getPreviousSemesterClasses(): Observable<ProgramaRowDto[]> {
    // Ajusta la URL al endpoint real cuando te lo confirmen
    return this.http.get<ProgramaRowDto[]>(`${this.baseUrl}/api/programas/previous-semester`);
  }
}




