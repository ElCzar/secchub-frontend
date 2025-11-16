export interface TeacherScheduleConflictResponseDTO {
    userId: number;
    userName: string;
    conflictDay: string;
    conflictStartTime: string; // ISO time string
    conflictEndTime: string;   // ISO time string
    conflictingClassesIds: number[];
}