export interface SystemStatusSummary {
  activePlannings: { completedSections: number; totalSections: number };
  pendingTeachers: number;                // docentes sin confirmar disponibilidad
  scheduleConflicts: number;              // conflictos de horario detectados
  classesWithoutTeacher: number;          // clases sin docente asignado
  classesWithoutClassroom: number;        // clases sin aula asignada
  nextDeadline: string;                   // ISO date string
}

export interface SectionRow {
  sectionCode: string;
  status: 'CLOSED' | 'EDITING';
  assignedClasses: number;
  unconfirmedTeachers: number;
}

export interface SectionsSummary {
  rows: SectionRow[];
}

export interface ActionRow {
  type: 'CLASSROOM_SCHEDULE' | 'TEACHER_SCHEDULE' | 'TEACHING_ASSISTANT_SCHEDULE' | 'MISSING_TEACHER' | 'MISSING_CLASSROOM';
  isConflict: boolean;
  resourceName: string;
  details: string;
}

export interface ActionsSummary {
  rows: ActionRow[];
}