import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProgramaContextDto } from "../models/context.models";
import { Observable, BehaviorSubject, of } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { CourseDTO, AcademicRequestBatchDTO } from "../models/academic-request.models";



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

// models de apoyo
export interface CourseOption {
  id: string;
  name: string;
  sectionId?: number; // Include sectionId from the full course data
  credits?: number;   // Include credits for potential future use
}


@Injectable({ providedIn: 'root' })
export class ProgramasService {
  private readonly baseUrl = environment.apiUrl;
  private coursesCache: CourseDTO[] = [];
  private readonly coursesLoaded = new BehaviorSubject<boolean>(false);

  constructor(private readonly http: HttpClient) {
    // Load all courses on service initialization
    this.loadAllCourses();
  }

  getContext(): Observable<ProgramaContextDto> {
    return this.http.get<ProgramaContextDto>(`${this.baseUrl}/api/programas/context`);
  }

  // Carga las clases guardadas en el semestre anterior para esta carrera/usuario
  getPreviousSemesterClasses(): Observable<ProgramaRowDto[]> {
    return this.http.get<ProgramaRowDto[]>(`${this.baseUrl}/api/programas/previous-semester`);
  }

  // Load all courses initially via HTTP GET
  private loadAllCourses(): void {
    this.http.get<CourseDTO[]>(`${this.baseUrl}/courses`).subscribe({
      next: (courses) => {
        this.coursesCache = courses;
        this.coursesLoaded.next(true);
        console.log(`Loaded ${courses.length} courses`);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.coursesLoaded.next(true); // Mark as loaded even on error to prevent hanging
      }
    });
  }

  // Local search in cached courses by name only
  searchCourses(q: string): Observable<CourseOption[]> {
    if (!q || q.length < 2) {
      return of([]);
    }

    return this.coursesLoaded.pipe(
      map(() => {
        const searchTerm = q.toLowerCase().trim();
        return this.coursesCache
          .filter(course =>
            course.isValid && // Only include valid courses
            course.name.toLowerCase().includes(searchTerm) // Search only by name
          )
          .map(course => ({
            id: course.id.toString(),
            name: course.name,
            sectionId: course.sectionId,
            credits: course.credits
          }))
          .slice(0, 10); // Limit results to 10 items
      })
    );
  }

  // Get course details by ID from cache
  getCourseById(courseId: string): CourseDTO | null {
    return this.coursesCache.find(course => course.id.toString() === courseId) || null;
  }

  // Get all courses as options (for dropdown/selection use)
  getAllCourseOptions(): Observable<CourseOption[]> {
    return this.coursesLoaded.pipe(
      map(() => this.coursesCache
        .filter(course => course.isValid)
        .map(course => ({
          id: course.id.toString(),
          name: course.name,
          sectionId: course.sectionId,
          credits: course.credits
        }))
      )
    );
  }

  // Get all courses (useful for debugging or other components)
  getAllCourses(): Observable<CourseDTO[]> {
    return this.coursesLoaded.pipe(
      map(() => this.coursesCache)
    );
  }

  // Method to manually refresh courses if needed
  refreshCourses(): void {
    // Clear cache and reload
    this.coursesCache = [];
    this.coursesLoaded.next(false);
    this.loadAllCourses();
  }

  // Get current courses count (useful for debugging/monitoring)
  getCoursesCount(): number {
    return this.coursesCache.length;
  }

  // Check if courses are loaded
  areCoursesLoaded(): Observable<boolean> {
    return this.coursesLoaded.asObservable();
  }

  // Enviar solicitudes académicas en lote
  submitAcademicRequests(batch: AcademicRequestBatchDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/academic-requests`, batch);
  }
}





