// Modelo local extendido del TeacherDTO para la interfaz de docentes
export interface Docente {
  // Campos del backend (TeacherDTO)
  id?: number;
  name: string;
  lastName?: string;
  email?: string;
  maxHours?: number;
  assignedHours?: number;
  availableHours?: number;
  extraHours?: number;
  contractType?: string;
  
  // Campos adicionales para la interfaz
  subjects?: string[];        // Materias que ha dictado el docente
  selected: boolean;          // Indicador de si el docente está seleccionado
  semesters?: string[];       // Semestres en los que ha dictado
  classes?: ClaseDocente[];   // Clases detalladas que dicta el docente
  observaciones?: string[];   // Observaciones del docente
}

export interface ClaseDocente {
  materia: string;           // Nombre de la materia
  seccion: string;           // Sección (ej: SIS-01)
  semestre: string;          // Semestre (ej: 2024-01)
  horarios: string[];        // Horarios de las clases
  numeroClases: number;      // Número de clases
}

// Función para convertir TeacherDTO a Docente
export function convertTeacherDTOToDocente(teacher: any): Docente {
  // Usar directamente los campos name y lastName del TeacherDTO
  // Ya vienen correctamente mapeados desde el servicio con la info del usuario
  const name = teacher.name || '';
  const lastName = teacher.lastName || '';
  
  return {
    id: teacher.id,
    name: name || 'Sin nombre',
    lastName: lastName,
    email: teacher.email,
    maxHours: teacher.maxHours,
    assignedHours: teacher.assignedHours,
    availableHours: teacher.availableHours,
    extraHours: teacher.extraHours,
    contractType: teacher.contractType || 'No especificado',
    subjects: teacher.subjects || [],
    selected: false,
    semesters: teacher.semesters || [],
    classes: teacher.classes || [],
    observaciones: teacher.observaciones || []
  };
}
