export interface SystemStatusSummary {
  activePlannings: { completedSections: number; totalSections: number };
  pendingTeachers: number;                // docentes sin confirmar disponibilidad
  scheduleConflicts: number;              // conflictos de horario detectados
  classesWithoutTeacher: number;          // clases sin docente asignado
  classesWithoutClassroom: number;        // clases sin aula asignada
  nextDeadline: string;                   // ISO date string
}

export interface SectionRow {
  sectionCode: string;        // ej. 'Sis-01'
  status: 'CLOSED' | 'EDITING';
  assignedClasses: number;
  unconfirmedTeachers: number;
}

export interface SectionsSummary {
  rows: SectionRow[];
}

export interface DashboardResponse {
  system: SystemStatusSummary;
  sections: SectionsSummary;
}