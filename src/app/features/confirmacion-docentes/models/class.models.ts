export interface TeacherClassRow {
  id: string;          // Id Clase
  section: string;     // Sección
  subject: string;     // Materia
  semester: string;    // 2025-03
  schedules: string[]; // texto por renglón ("Lu. Mi. 8-10am", "Lu. Vi. 2-5pm")
}
