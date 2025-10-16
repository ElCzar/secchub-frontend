import { TeachingAssistantScheduleResponseDTO } from './TeachingAssistantScheduleResponseDTO.model';

export interface TeachingAssistantResponseDTO {
    id: number;
    classId: number;
    studentApplicationId: number;
    weeklyHours: number;
    weeks: number;
    totalHours: number;
    schedules: TeachingAssistantScheduleResponseDTO[];
}