export interface ClassroomScheduleConflictResponseDTO {
  classroomId: number;
  classroomName: string;
  conflictStartTime: string; // ISO time string
  conflictEndTime: string;   // ISO time string
  day: string;
  conflictingClassesIds: number[];
}