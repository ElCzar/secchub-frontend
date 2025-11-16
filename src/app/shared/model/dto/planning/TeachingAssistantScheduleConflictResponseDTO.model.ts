export interface TeachingAssistantScheduleConflictResponseDTO {
  userId: number;
  userName: string;
  conflictStartTime: string;
  conflictEndTime: string;
  day: string;
  conflictTeachingAssistants: number[];
}