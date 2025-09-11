export type DayCode = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';

export interface AvailabilityRow {
  day: DayCode | '';
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  total: number; // horas calculadas
}

export function newAvailabilityRow(): AvailabilityRow {
  return { day: '', start: '', end: '', total: 0 };
}
