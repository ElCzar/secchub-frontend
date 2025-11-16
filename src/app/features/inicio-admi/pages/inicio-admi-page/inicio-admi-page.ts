import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SectionsSummary, SystemStatusSummary } from '../../models/dashboard.models';
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { SystemStatusCard } from '../../components/system-status-card/system-status-card';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SectionSummaryTable } from '../../components/section-summary-table/section-summary-table';
import { DashboardService } from '../../services/dashboard.service';
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';

@Component({
  selector: 'app-inicio-admi-page',
  imports: [
    CommonModule,
    AccesosRapidosAdmi, 
    SidebarToggleButtonComponent, 
    SystemStatusCard, 
    HeaderComponent, 
    SectionSummaryTable
  ],
  templateUrl: './inicio-admi-page.html',
  styleUrls: ['./inicio-admi-page.scss']
})
export class InicioAdmiPage implements OnInit {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly courseService: CourseInformationService,
    private readonly semesterService: SemesterInformationService
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


  // Parametric data
  courses: CourseResponseDTO[] = [];

  ngOnInit(): void {
    this.obtainParameters();
    this.obtainSectionsSummary();
    this.obtainActions();
    this.obtainConflicts();
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
      },
      error: (err) => {
        console.error('Error al cargar las clases sin aula asignada:', err);
        this.systemStatus.classesWithoutClassroom = 0;
      }
    });

    this.dashboardService.getClassesWithoutTeacher().subscribe({
      next: (data) => {
        this.systemStatus.classesWithoutTeacher = data.length;
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
      },
      error: (err) => {
        console.error('Error al cargar los conflictos de horario:', err);
      }
    });

    this.dashboardService.getTeacherConflicts().subscribe({
      next: (data) => {
        this.systemStatus.scheduleConflicts += data.length;
      },
      error: (err) => {
        console.error('Error al cargar los conflictos de horario de profesores:', err);
      }
    });

    this.dashboardService.getTeachingAssistantConflicts().subscribe({
      next: (data) => {
        this.systemStatus.scheduleConflicts += data.length;
      },
      error: (err) => {
        console.error('Error al cargar los conflictos de horario de asistentes de enseñanza:', err);
      }
    });
  }
}

