// src/app/features/inicio-seccion/models/section-dashboard.models.ts
export interface TaskStatusSummary {
  classesWithoutRoom: number;
  classesWithoutTeacher: number;
  scheduleConflicts: {
    count: number;
    details: string; // e.g., "Redes"
  };
  unconfirmedTeachers: {
    count: number;
    details: string; // e.g., "ver detalles"
  };
  deadline: {
    date: string; // '2025-08-15'
    daysRemaining: number;
  };
}

export interface ProgressStatus {
  requestsReceived: 'completed' | 'incomplete';
  roomsAssigned: 'completed' | 'incomplete';
  teachersAssigned: 'completed' | 'incomplete';
  confirmationsSent: 'sent' | 'pending';
  confirmationsReceived: {
    status: 'pending';
    count: number;
  };
  scheduleConflicts: {
    status: 'conflict';
    count: number;
  };
  planningClosed: 'yes' | 'no';
}

export interface SectionDashboardResponse {
  taskStatus: TaskStatusSummary;
  progressStatus: ProgressStatus;
}
