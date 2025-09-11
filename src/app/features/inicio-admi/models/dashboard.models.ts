// src/app/features/inicio-admi/models/dashboard.models.ts
export interface SystemStatusSummary {
  activePlannings: { completedSections: number; totalSections: number };
  pendingTeachers: number;                // docentes sin confirmar disponibilidad
  scheduleConflicts: number;              // conflictos de horario
  nextDeadline: string;                   // ISO date string, ej. '2025-08-15'
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
