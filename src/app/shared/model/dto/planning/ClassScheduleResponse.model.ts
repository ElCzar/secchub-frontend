export interface ClassScheduleResponseDTO {
    id: number;
    classId: number;
    classroomId: number;
    day: string;
    startTime: string;
    endTime: string;
    modalityId: number;
    disability: boolean;
}