import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ProgramaContextDto } from "../models/context.models";
import { Observable, BehaviorSubject, of } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { CourseDTO, AcademicRequestBatchDTO, AcademicRequestResponseDTO, RequestScheduleResponseDTO } from "../models/academic-request.models";
import { SemesterResponseDTO } from "../../../shared/model/dto/admin/SemesterResponseDTO.model";



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

// Removemos esta interfaz porque ya tenemos SemesterResponseDTO


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
    console.log('🔍 ProgramasService: Solicitando contexto del usuario...');
    console.log('🌐 URL del endpoint:', `${this.baseUrl}/academic-requests/context`);
    
    return this.http.get<any>(`${this.baseUrl}/academic-requests/context`).pipe(
      map(response => {
        console.log('✅ ProgramasService: Response from context endpoint:', response);
        const context = {
          careerId: response.careerId,
          careerName: response.careerName,
          semester: response.semester
        };
        console.log('📦 ProgramasService: Contexto mapeado:', context);
        return context;
      })
      // Sin catchError - si falla, que falle completamente
    );
  }

  // Carga las clases guardadas en el semestre anterior para esta carrera/usuario  
  getPreviousSemesterClasses(): Observable<ProgramaRowDto[]> {
    // Esta funcionalidad se implementa a través de loadPreviousSemesterRequests()
    return this.loadPreviousSemesterRequests().pipe(
      map(requests => requests.map(req => {
        // Calcular semanas
        const weeks = this.calculateWeeks(req.startDate, req.endDate);
        // Obtener la sección del curso
        const course = this.getCourseById(String(req.courseId));
        
        return {
          courseId: String(req.courseId),
          courseName: req.courseName || course?.name || '',
          section: course?.sectionId ? String(course.sectionId) : '',
          roomType: '',
          seats: req.capacity,
          startDate: req.startDate,
          endDate: req.endDate,
          weeks: weeks
        };
      }))
    );
  }

  private calculateWeeks(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) {
      return 0;
    }
    
    // Calcula semanas aproximadas: ceil(diferencia en días / 7)
    const diffMs = d2.getTime() - d1.getTime();
    const days = diffMs / (1000 * 60 * 60 * 24);
    return Math.ceil(days / 7);
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

  // Local search in cached courses by name or ID
  searchCourses(q: string, searchById: boolean = false): Observable<CourseOption[]> {
    if (!q || q.length < 2) {
      return of([]);
    }

    return this.coursesLoaded.pipe(
      map(() => {
        const searchTerm = q.toLowerCase().trim();
        return this.coursesCache
          .filter(course =>
            course.isValid && // Only include valid courses
            (searchById
              ? course.id.toString().toLowerCase().includes(searchTerm) // Search by ID
              : course.name.toLowerCase().includes(searchTerm)) // Search by name
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

  // ===== Semesters & previous semester orchestration =====
  getCurrentSemester(): Observable<SemesterResponseDTO> {
    return this.http.get<SemesterResponseDTO>(`${this.baseUrl}/semesters/current`);
  }

  getSemesterBy(year: number, period: 1 | 2): Observable<SemesterResponseDTO> {
    return this.http.get<SemesterResponseDTO>(`${this.baseUrl}/semesters`, {
      params: { year: String(year), period: String(period) }
    });
  }

  getAcademicRequestsBySemester(semesterId: number): Observable<AcademicRequestResponseDTO[]> {
    return this.http.get<AcademicRequestResponseDTO[]>(`${this.baseUrl}/academic-requests/by-semester`, {
      params: { semesterId: String(semesterId) }
    });
  }

  /**
   * Obtiene todos los semestres disponibles
   */
  getAllSemesters(): Observable<SemesterResponseDTO[]> {
    return this.http.get<SemesterResponseDTO[]>(`${this.baseUrl}/semesters/all`);
  }

  /**
   * Obtiene todos los semestres disponibles excluyendo el actual (filtrado en frontend)
   */
  getAllSemestersExceptCurrent(): Observable<SemesterResponseDTO[]> {
    return this.getAllSemesters().pipe(
      map(semesters => semesters.filter(semester => !semester.isCurrent))
    );
  }

  /**
   * Carga solicitudes (con horarios) del semestre anterior al actual.
   * Regla: si current.period=2 => anterior es (year, period 1);
   *        si current.period=1 => anterior es (year-1, period 2)
   */
  loadPreviousSemesterRequests(): Observable<AcademicRequestResponseDTO[]> {
    return this.getCurrentSemester().pipe(
      switchMap((cur) => {
        const prevPeriod: 1 | 2 = cur.period === 2 ? 1 : 2;
        const prevYear = cur.period === 2 ? cur.year : (cur.year - 1);
        console.log(`🔍 Buscando semestre anterior: ${prevYear}-${prevPeriod}`);
        return this.getSemesterBy(prevYear, prevPeriod);
      }),
      switchMap((prev) => {
        if (!prev || !prev.id) {
          console.warn('⚠️ No se encontró el semestre anterior');
          return of([]);
        }
        console.log(`✅ Semestre anterior encontrado: ${prev.year}-${prev.period} (ID: ${prev.id})`);
        return this.getAcademicRequestsBySemester(prev.id);
      }),
      catchError((error) => {
        console.warn('❌ Error al buscar solicitudes del semestre anterior:', error);
        return of([]);
      })
    );
  }
}





