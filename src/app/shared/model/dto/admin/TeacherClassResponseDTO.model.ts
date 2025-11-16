export interface TeacherClassResponseDTO {
    id: number;
    semesterId: number;
    teacherId: number;
    classId: number;
    workHours: number;
    fullTimeExtraHours: number;
    adjunctExtraHours: number;
    decision: boolean | null;
    observation: string | null;
    statusId: number;
    teacherName: string;
    teacherLastName: string;
    teacherEmail: string;
    teacherMaxHours: number;
    teacherContractType: string;
}