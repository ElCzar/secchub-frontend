import { TeacherAssignmentService, ClassDTO } from '../../../planificacion/services/teacher-assignment.service';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TeacherSelectModalUtil {
  constructor(
    private readonly teacherAssignmentService: TeacherAssignmentService,
    private readonly semesterInformationService: SemesterInformationService
  ) {}

  /**
   * Calcula las horas asignadas a un docente para el semestre actual, solo si employment_type_id === 1 y decision === 1
   */
  getAssignedHoursForTeacher(teacherId: number, employmentTypeId: number): Promise<number> {
    if (employmentTypeId !== 1) return Promise.resolve(0);
    // Utiliza el endpoint /v1/teachers/{teacherId}/classes para obtener las asignaciones
    return new Promise((resolve) => {
      this.semesterInformationService.getCurrentSemester().subscribe(sem => {
        const currentSemesterId = sem.id;
        this.teacherAssignmentService.getClassesAssignedToTeacher(teacherId).subscribe((classes: any[]) => {
          const total = classes
            .filter(c => c.semesterId === currentSemesterId && c.decision === 1)
            .reduce((sum, c) => sum + (c.workHours || 0), 0);
          resolve(total);
        });
      });
    });
  }
}
