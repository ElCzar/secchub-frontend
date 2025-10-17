import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseRequestDTO } from '../../../shared/model/dto/admin/CourseRequestDTO.model';
import { CourseResponseDTO } from '../../../shared/model/dto/admin/CourseResponseDTO.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseChangeService {
  private readonly apiUrl = `${environment.apiUrl}/courses`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new course
   * @param courseRequest Course data for creation
   * @returns Observable with the created course
   */
  createCourse(courseRequest: CourseRequestDTO): Observable<CourseResponseDTO> {
    return this.http.post<CourseResponseDTO>(this.apiUrl, courseRequest);
  }

  /**
   * Update an existing course given its ID
   * @param courseId Course ID
   * @param courseRequest Updated course data
   * @returns Observable with the updated course
   */
  updateCourse(courseId: number, courseRequest: CourseRequestDTO): Observable<CourseResponseDTO> {
    return this.http.put<CourseResponseDTO>(`${this.apiUrl}/${courseId}`, courseRequest);
  }

  /**
   * Partially update a course given its ID
   * @param courseId Course ID
   * @param updates Map of fields to update
   * @returns Observable with the updated course
   */
  patchCourse(courseId: number, updates: { [key: string]: any }): Observable<CourseResponseDTO> {
    return this.http.patch<CourseResponseDTO>(`${this.apiUrl}/${courseId}`, updates);
  }

  /**
   * Delete a course by its ID
   * @param courseId Course ID
   * @returns Observable with void response
   */
  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${courseId}`);
  }

  /**
   * Convert CourseResponseDTO to CourseRequestDTO for updates
   * @param course Course response data
   * @returns Course request data
   */
  mapToRequestDTO(course: CourseResponseDTO): CourseRequestDTO {
    return {
      sectionId: course.sectionId,
      name: course.name || '',
      credits: course.credits || 0,
      description: course.description,
      isValid: true, // Default value, adjust as needed
      recommendation: course.recommendation,
      statusId: course.statusId || 1 // Default to active status
    };
  }

  /**
   * Create CourseRequestDTO from form data
   * @param formData Form data object
   * @param sectionId Selected section ID
   * @param statusId Selected status ID
   * @returns Course request data
   */
  createRequestDTO(formData: any, sectionId?: number, statusId?: number): CourseRequestDTO {
    return {
      sectionId: sectionId,
      name: formData.name || '',
      credits: formData.credits || 0,
      description: formData.description || '',
      isValid: true,
      recommendation: formData.recommendation || '',
      statusId: statusId || 1
    };
  }
}