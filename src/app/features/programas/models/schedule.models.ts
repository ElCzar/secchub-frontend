export type Modality = 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
export type RoomType = 'Laboratorio' | 'Aulas' | 'Aulas Moviles' | 'Aulas Accesibles';

export interface ScheduleRow {
  day: 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM' | '';
  startTime: string;   // formato "HH:mm"
  endTime: string;     // formato "HH:mm"
  disability: boolean; // discapacidad (sí/no)
  modality: Modality;  // modalidad
  roomType: RoomType; // tipo de aula (valor interno legible)
  roomTypeId?: number; // id real del tipo de aula (backend)
}

export function newSchedule(): ScheduleRow {
  return {
    day: '',
    startTime: '',
    endTime: '',
    disability: false,
    modality: 'PRESENCIAL',
    roomType: 'Aulas',
    roomTypeId: undefined,
  };
}


