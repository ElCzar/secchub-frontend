import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
    StatusDTO,
    RoleDTO,
    DocumentTypeDTO,
    EmploymentTypeDTO,
    ModalityDTO,
    ClassroomTypeDTO
} from '../model/dto/parametric';

@Injectable({
    providedIn: 'root'
})
export class ParametricService {
    private readonly baseUrl = `${environment.apiUrl}/parametric`;

    constructor(private readonly http: HttpClient) {}

    // Status methods
    getAllStatuses(): Observable<StatusDTO[]> {
    return this.http.get<StatusDTO[]>(`${this.baseUrl}/statuses`).pipe(
        catchError((error) => {
        console.error('Error loading statuses:', error);
        return of([]);
        })
    );
    }

    getStatusById(id: number): Observable<string | null> {
        return this.http.get(`${this.baseUrl}/statuses/${id}`, { responseType: 'text' }).pipe(
            catchError((error) => {
                console.error(`Error loading status ${id}:`, error);
                return of(null);
            })
        );
    }    // Role methods
    getAllRoles(): Observable<RoleDTO[]> {
    return this.http.get<RoleDTO[]>(`${this.baseUrl}/roles`).pipe(
        catchError((error) => {
        console.error('Error loading roles:', error);
        return of([]);
        })
    );
    }

    getRoleById(id: number): Observable<string | null> {
        return this.http.get(`${this.baseUrl}/roles/${id}`, { responseType: 'text' }).pipe(
            catchError((error) => {
                console.error(`Error loading role ${id}:`, error);
                return of(null);
            })
        );
    }    // Document Type methods
    getAllDocumentTypes(): Observable<DocumentTypeDTO[]> {
    return this.http.get<DocumentTypeDTO[]>(`${this.baseUrl}/document-types`).pipe(
        catchError((error) => {
        console.error('Error loading document types:', error);
        return of([]);
        })
    );
    }

    getDocumentTypeById(id: number): Observable<string | null> {
        return this.http.get(`${this.baseUrl}/document-types/${id}`, { responseType: 'text' }).pipe(
            catchError((error) => {
                console.error(`Error loading document type ${id}:`, error);
                return of(null);
            })
        );
    }    // Employment Type methods
    getAllEmploymentTypes(): Observable<EmploymentTypeDTO[]> {
    return this.http.get<EmploymentTypeDTO[]>(`${this.baseUrl}/employment-types`).pipe(
        catchError((error) => {
        console.error('Error loading employment types:', error);
        return of([]);
        })
    );
    }

    getEmploymentTypeById(id: number): Observable<string | null> {
        return this.http.get(`${this.baseUrl}/employment-types/${id}`, { responseType: 'text' }).pipe(
            catchError((error) => {
                console.error(`Error loading employment type ${id}:`, error);
                return of(null);
            })
        );
    }    // Modality methods
    getAllModalities(): Observable<ModalityDTO[]> {
    return this.http.get<ModalityDTO[]>(`${this.baseUrl}/modalities`).pipe(
        catchError((error) => {
        console.error('Error loading modalities:', error);
        return of([]);
        })
    );
    }

    getModalityById(id: number): Observable<string | null> {
        return this.http.get(`${this.baseUrl}/modalities/${id}`, { responseType: 'text' }).pipe(
            catchError((error) => {
                console.error(`Error loading modality ${id}:`, error);
                return of(null);
            })
        );
    }    // Classroom Type methods
    getAllClassroomTypes(): Observable<ClassroomTypeDTO[]> {
    return this.http.get<ClassroomTypeDTO[]>(`${this.baseUrl}/classroom-types`).pipe(
        catchError((error) => {
        console.error('Error loading classroom types:', error);
        return of([]);
        })
    );
    }

    getClassroomTypeById(id: number): Observable<string | null> {
        return this.http.get(`${this.baseUrl}/classroom-types/${id}`, { responseType: 'text' }).pipe(
            catchError((error) => {
                console.error(`Error loading classroom type ${id}:`, error);
                return of(null);
            })
        );
    }    // Utility method to get all parametric data at once
    getAllParametricData(): Observable<{
    statuses: StatusDTO[];
    roles: RoleDTO[];
    documentTypes: DocumentTypeDTO[];
    employmentTypes: EmploymentTypeDTO[];
    modalities: ModalityDTO[];
    classroomTypes: ClassroomTypeDTO[];
    }> {
    return new Observable(observer => {
        const data = {
        statuses: [] as StatusDTO[],
        roles: [] as RoleDTO[],
        documentTypes: [] as DocumentTypeDTO[],
        employmentTypes: [] as EmploymentTypeDTO[],
        modalities: [] as ModalityDTO[],
        classroomTypes: [] as ClassroomTypeDTO[]
        };

        let completedRequests = 0;
        const totalRequests = 6;

        const checkCompletion = () => {
        completedRequests++;
        if (completedRequests === totalRequests) {
            observer.next(data);
            observer.complete();
        }
        };

        this.getAllStatuses().subscribe(statuses => {
        data.statuses = statuses;
        checkCompletion();
        });

        this.getAllRoles().subscribe(roles => {
        data.roles = roles;
        checkCompletion();
        });

        this.getAllDocumentTypes().subscribe(documentTypes => {
        data.documentTypes = documentTypes;
        checkCompletion();
        });

        this.getAllEmploymentTypes().subscribe(employmentTypes => {
        data.employmentTypes = employmentTypes;
        checkCompletion();
        });

        this.getAllModalities().subscribe(modalities => {
        data.modalities = modalities;
        checkCompletion();
        });

        this.getAllClassroomTypes().subscribe(classroomTypes => {
        data.classroomTypes = classroomTypes;
        checkCompletion();
        });
    });
    }
}