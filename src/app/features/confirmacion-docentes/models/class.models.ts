export interface TeacherClassRow {
  teacherClassId: number; // Id Clase Docente
  id: number;          // Id Clase
  section: string;     // Sección
  subject: string;     // Materia
  semester: string;    // 2025-03
  schedules: string[]; // texto por renglón ("Lu. Mi. 8-10am", "Lu. Vi. 2-5pm")
  accepted: boolean;  // true si fue aceptada, false si está pendiente o rechazada
}
