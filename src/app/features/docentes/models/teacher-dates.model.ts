export interface TeacherDatesRequest {
  startDate: string; // ISO date format (YYYY-MM-DD)
  endDate: string;   // ISO date format (YYYY-MM-DD)
}

export interface TeacherClassWithDates {
  id: number;
  semesterId: number;
  teacherId: number;
  classId: number;
  workHours: number;
  fullTimeExtraHours?: number;
  adjunctExtraHours?: number;
  decision?: boolean;
  observation?: string;
  statusId: number;
  startDate?: string; // ISO date format (YYYY-MM-DD)
  endDate?: string;   // ISO date format (YYYY-MM-DD)
  
  // Teacher information fields
  teacherName?: string;
  teacherLastName?: string;
  teacherEmail?: string;
  teacherMaxHours?: number;
  teacherContractType?: string;
}

export interface TeacherDatePopupData {
  teacherClassId: number;
  teacherName: string;
  className: string;
  currentStartDate?: string;
  currentEndDate?: string;
  semesterStartDate: string;
  semesterEndDate: string;
}