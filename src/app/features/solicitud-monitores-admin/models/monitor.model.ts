import { HorarioMonitor } from './horario-monitor.model';

export interface Monitor {
  id: string;
  nombre: string;
  apellido: string;
  carrera: string;
  semestre: number;
  promedio: number;
  profesor: string;
  noClase: number;
  asignatura: string;
  nota: number;
  horasSemanales: number;
  semanas: number;
  totalHoras: number;
  correo: string;
  antiguo: boolean;
  administrativo: boolean;
  seccionAcademica?: string; // Nueva columna para administrativos
  horarios: HorarioMonitor[];
  seleccionado: boolean;
  showHorarios?: boolean; // Propiedad opcional para mostrar/ocultar horarios en la UI
  editing?: boolean; // Propiedad opcional para indicar si está en modo edición
  estado?: 'aceptado' | 'rechazado' | 'pendiente'; // Estado de aprobación
}
