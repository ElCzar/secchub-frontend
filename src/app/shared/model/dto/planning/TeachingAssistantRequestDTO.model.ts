import { TeachingAssistantScheduleRequestDTO } from './TeachingAssistantScheduleRequestDTO.model';

export interface TeachingAssistantRequestDTO {
    classId: number;
    studentApplicationId: number;
    weeklyHours: number;
    weeks: number;
    totalHours: number;
    schedules: TeachingAssistantScheduleRequestDTO[];
}