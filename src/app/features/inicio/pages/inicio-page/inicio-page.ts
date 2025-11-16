import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActionsSummary, SectionsSummary, SystemStatusSummary } from '../../models/dashboard.models';
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { SystemStatusCard } from '../../components/system-status-card/system-status-card';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SectionSummaryTable } from '../../components/section-summary-table/section-summary-table';
import { DashboardService } from '../../services/dashboard.service';
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { AccesosRapidosSeccion } from "../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion";
import { Router } from '@angular/router';
import { PopUpCerrarPlanificacion } from "../../../../shared/components/pop-up-cerrar-planificacion/pop-up-cerrar-planificacion";
import { ActionSummaryCard } from "../../components/action-summary-card/action-summary-card";

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [
    CommonModule,
    AccesosRapidosAdmi,
    SidebarToggleButtonComponent,
    SystemStatusCard,
    HeaderComponent,
    SectionSummaryTable,
    AccesosRapidosSeccion,
    PopUpCerrarPlanificacion,
    ActionSummaryCard
],
  templateUrl: './inicio-page.html',
  styleUrls: ['./inicio-page.scss']
})
export class InicioPage implements OnInit {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly courseService: CourseInformationService,
    private readonly semesterService: SemesterInformationService,
    private readonly router: Router
  ) {}

  // Components data
  sectionsSummary: SectionsSummary = {
    rows: []
  };
  systemStatus: SystemStatusSummary = {
    activePlannings: { completedSections: 0, totalSections: 0 },
    pendingTeachers: 0,
    scheduleConflicts: 0,
    classesWithoutTeacher: 0,
    classesWithoutClassroom: 0,
    nextDeadline: ''
  };
  mostrarPopupCerrar: boolean = false;
  actionSummary: ActionsSummary = {
    rows: []
  };


  // Parametric data
  courses: CourseResponseDTO[] = [];

  ngOnInit(): void {
    this.obtainParameters();
    if (this.isAdmin()) {
      this.obtainSectionsSummary();
    }
    this.obtainConflicts();
    this.obtainActions();
  }

  /**
   * Obtains general parameters for the admin dashboard.
   */
  obtainParameters(): void {
    this.courseService.findAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (err) => {
        console.error('Error al cargar los cursos:', err);
        this.courses = [];
      }
    });

    this.semesterService.getCurrentSemester().subscribe({
      next: (data) => {
        this.systemStatus.nextDeadline = data.startDate || '';
      },
      error: (err) => {
        console.error('Error al cargar el semestre actual:', err);
        this.systemStatus.nextDeadline = '';
      }
    });
  }

  /**
   * Obtains the summary of sections from the dashboard service.
   */
  obtainSectionsSummary(): void {
    this.dashboardService.getSectionsSummary().subscribe({
      next: (data) => {
        this.sectionsSummary = data;
        const closedSections = data.rows.filter(row => row.status === 'CLOSED').length;
        const totalSections = data.rows.length;
        this.systemStatus.activePlannings = { completedSections: closedSections, totalSections: totalSections };
      },
      error: (err) => {
        console.error('Error al cargar el resumen de secciones:', err);
        // Datos de respaldo en caso de error
        this.sectionsSummary = {
          rows: []
        };
        this.systemStatus.activePlannings = { completedSections: 0, totalSections: 0 };
      }
    });
  }

  /**
   * Obtains the actions for the admin dashboard.
   * Includes missing teacher and classroom assignments.
   */
  obtainActions(): void {
    this.dashboardService.getClassesWithoutClassroom().subscribe({
      next: (data) => {
        this.systemStatus.classesWithoutClassroom = data.length;
        this.actionSummary.rows.push(...data.map(item => ({
          type: 'MISSING_CLASSROOM' as const,
          isConflict: false,
          resourceName: this.courses.find(course => course.id === item.courseId)?.name + ' sección ' + item.id || 'Desconocido',
          details: ''
        })));
      },
      error: (err) => {
        console.error('Error al cargar las clases sin aula asignada:', err);
        this.systemStatus.classesWithoutClassroom = 0;
      }
    });

    this.dashboardService.getClassesWithoutTeacher().subscribe({
      next: (data) => {
        this.systemStatus.classesWithoutTeacher = data.length;
        this.actionSummary.rows.push(...data.map(item => ({
          type: 'MISSING_TEACHER' as const,
          isConflict: false,
          resourceName: this.courses.find(course => course.id === item.courseId)?.name + ' sección ' + item.id || 'Desconocido',
          details: ''
        })));
      },
      error: (err) => {
        console.error('Error al cargar las clases sin profesor asignado:', err);
        this.systemStatus.classesWithoutTeacher = 0;
      }
    });

    this.dashboardService.countPendingTeacherConfirmations().subscribe({
      next: (data) => {
        this.systemStatus.pendingTeachers = data;
      },
      error: (err) => {
        console.error('Error al cargar las confirmaciones pendientes de profesores:', err);
        this.systemStatus.pendingTeachers = 0;
      }
    });
  }

  /**
   * Obtains the conflicts for the admin dashboard.
   * Includes classroom, teacher, and teaching assistant schedule conflicts.
   */
  obtainConflicts(): void {
    this.dashboardService.getClassroomConflicts().subscribe({
      next: (data) => {
        this.systemStatus.scheduleConflicts += data.length;
        this.actionSummary.rows.push(...data.map(item => ({
          type: 'CLASSROOM_SCHEDULE' as const,
          isConflict: true,
          resourceName: 'Aula ' + item.classroomName,
          details: 'Múltiples asignaciones de aula en el horario de ' + item.conflictStartTime + ' a ' + item.conflictEndTime + ' los días ' + item.day
        })));
      },
      error: (err) => {
        console.error('Error al cargar los conflictos de horario:', err);
      }
    });

    this.dashboardService.getTeacherConflicts().subscribe({
      next: (data) => {
        this.systemStatus.scheduleConflicts += data.length;
        this.actionSummary.rows.push(...data.map(item => ({
          type: 'TEACHER_SCHEDULE' as const,
          isConflict: true,
          resourceName: 'Profesor(a) ' + item.teacherName,
          details: 'Múltiples asignaciones de profesor(a) en el horario de ' + item.conflictStartTime + ' a ' + item.conflictEndTime + ' los días ' + item.conflictDay
        })));
      },
      error: (err) => {
        console.error('Error al cargar los conflictos de horario de profesores:', err);
      }
    });

    this.dashboardService.getTeachingAssistantConflicts().subscribe({
      next: (data) => {
        this.systemStatus.scheduleConflicts += data.length;
        this.actionSummary.rows.push(...data.map(item => ({
          type: 'TEACHING_ASSISTANT_SCHEDULE' as const,
          isConflict: true,
          resourceName: "Estudiante " + item.userName + " con id " + item.userId,
          details: 'conflicto de horario de ' + item.conflictStartTime + ' a ' + item.conflictEndTime + ' los días ' + item.day
        })));
      },
      error: (err) => {
        console.error('Error al cargar los conflictos de horario de asistentes de enseñanza:', err);
      }
    });
  }

  /**
   * Opens the confirmation popup to close planning.
   */
  abrirPopupCerrarPlanificacion(): void {
    this.mostrarPopupCerrar = true;
  }

  /**
   * Confirms the closure of planning and calls the service to close it.
   */
  confirmarCierrePlanificacion(): void {
    this.mostrarPopupCerrar = false;
    this.dashboardService.closeSectionPlanning().subscribe({
      next: () => {
        console.log('Planificación cerrada con éxito.');
        this.router.navigate(['/inicio-seccion-deshabilitada']);
      },
      error: (err) => {
        console.error('Error al cerrar la planificación:', err);
      }
    });
  }

  /**
   * Cancels the closure of planning and hides the popup.
   */
  cancelarCierrePlanificacion(): void {
    this.mostrarPopupCerrar = false;
  }

  /**
   * Checks if the current user has admin role.
   * @returns boolean indicating if the user is an admin
   */
  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'ROLE_ADMIN';
  }
}

