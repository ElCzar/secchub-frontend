import { StudentApplicationScheduleRequestDTO } from "./StudentApplicationScheduleRequestDTO.model";

export interface StudentApplicationRequestDTO {
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
    schedules?: StudentApplicationScheduleRequestDTO[];
}