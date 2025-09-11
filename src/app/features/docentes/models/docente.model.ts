export interface Docente {
  name: string;              // Nombre del docente
  subjects: string[];        // Materias que ha dictado el docente
  selected: boolean;         // Indicador de si el docente está seleccionado
  semesters: string[];      // Semestres en los que ha dictado (opcional)
  classes?: ClaseDocente[];  // Clases detalladas que dicta el docente
  observaciones?: string[];  // Observaciones del docente
}

export interface ClaseDocente {
  materia: string;           // Nombre de la materia
  seccion: string;           // Sección (ej: SIS-01)
  semestre: string;          // Semestre (ej: 2024-01)
  horarios: string[];        // Horarios de las clases
  numeroClases: number;      // Número de clases
}
