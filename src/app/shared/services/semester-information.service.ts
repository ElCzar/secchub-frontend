import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SemesterRequestDTO } from '../model/dto/admin/SemesterRequestDTO.model';
import { SemesterResponseDTO } from '../model/dto/admin/SemesterResponseDTO.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SemesterInformationService {
    private readonly apiUrl = environment.apiUrl + "/semesters";

    constructor(private readonly http: HttpClient) {}

    createSemester(semesterRequestDTO: SemesterRequestDTO): Observable<SemesterResponseDTO> {
        return this.http.post<SemesterResponseDTO>(this.apiUrl, semesterRequestDTO);
    }

    getCurrentSemester(): Observable<SemesterResponseDTO> {
        return this.http.get<SemesterResponseDTO>(`${this.apiUrl}/current`);
    }

    getSemesterByYearAndPeriod(year: number, period: number): Observable<SemesterResponseDTO> {
        return this.http.get<SemesterResponseDTO>(this.apiUrl, {
            params: { year: year.toString(), period: period.toString() }
        });
    }

    getAllSemesters(): Observable<SemesterResponseDTO[]> {
        return this.http.get<SemesterResponseDTO[]>(`${this.apiUrl}/all`);
    }
}