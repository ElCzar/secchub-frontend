import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SemesterRequestDTO } from '../../../shared/model/dto/admin/SemesterRequestDTO.model';
import { SemesterResponseDTO } from '../../../shared/model/dto/admin/SemesterResponseDTO.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SemesterChangeService {
  private readonly apiUrl = `${environment.apiUrl}/semesters`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new semester
   * @param semesterRequest Semester data for creation
   * @returns Observable with the created semester
   */
  createSemester(semesterRequest: SemesterRequestDTO): Observable<SemesterResponseDTO> {
    semesterRequest.period = semesterRequest.period === 1 ? 10 : 30;
    return this.http.post<SemesterResponseDTO>(this.apiUrl, semesterRequest);
  }

  /**
   * Create SemesterRequestDTO from form data
   * @param formData Form data object with semester fields
   * @returns Semester request data
   */
  createRequestDTO(formData: any): SemesterRequestDTO {
    return {
      period: formData.period || 1,
      year: formData.year || new Date().getFullYear(),
      startDate: formData.startDate || '',
      endDate: formData.endDate || ''
    };
  }

  /**
   * Validate semester form data
   * @param formData Form data object
   * @returns true if valid, false otherwise
   */
  validateSemesterData(formData: any): boolean {
    return !!(
      formData.period && 
      formData.year && 
      formData.startDate && 
      formData.endDate &&
      formData.period >= 1 && 
      formData.period <= 2 &&
      formData.year >= 2020 &&
      new Date(formData.startDate) < new Date(formData.endDate)
    );
  }
}