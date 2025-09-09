export interface Docente {
  name: string;              // Nombre del docente
  subjects: string[];        // Materias que ha dictado el docente
  selected: boolean;         // Indicador de si el docente está seleccionado
  semesters: string[];      // Semestres en los que ha dictado (opcional)
}
