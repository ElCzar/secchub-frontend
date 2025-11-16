export interface TeacherScheduleConflictResponseDTO {
    teacherId: number;
    teacherName: string;
    conflictDay: string;
    conflictStartTime: string; // ISO time string
    conflictEndTime: string;   // ISO time string
    conflictingClassesIds: number[];
}