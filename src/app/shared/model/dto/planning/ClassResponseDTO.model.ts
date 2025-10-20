import { ClassScheduleResponseDTO } from "./ClassScheduleResponse.model";

export interface ClassResponseDTO {
    id: number;
    section: number;
    courseId: number;
    courseName: string;
    semesterId: number;
    startDate: Date;
    endDate: Date;
    observation: string;
    capacity: number;
    statusId: number;
    schedules: ClassScheduleResponseDTO[];
}