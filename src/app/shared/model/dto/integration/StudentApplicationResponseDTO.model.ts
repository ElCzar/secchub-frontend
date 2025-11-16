import { StudentApplicationScheduleResponseDTO } from "./StudentApplicationScheduleResponseDTO.model";

export interface StudentApplicationResponseDTO {
    id?: number;
    userId?: number;
    courseId?: number;
    sectionId?: number;
    semesterId?: number;
    program?: string;
    studentSemester?: number;
    academicAverage?: number;
    phoneNumber?: string;
    alternatePhoneNumber?: string;
    address?: string;
    personalEmail?: string;
    wasTeachingAssistant?: boolean;
    courseAverage?: number;
    courseTeacher?: string;
    applicationDate?: string; // ISO date string
    statusId?: number;
    schedules?: StudentApplicationScheduleResponseDTO[];
}