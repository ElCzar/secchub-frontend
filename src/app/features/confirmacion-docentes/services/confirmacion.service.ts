import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { TeacherClassRow } from '../models/class.models';

@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  // mocks solo para UI
  private readonly accepted: TeacherClassRow[] = [
    { id: '25356', section: 'SIS-01', subject: 'Redes',   semester: '2025-03', schedules: ['Lu. Mi. 8-10am', 'Lu. Vi. 2-5pm'] },
    { id: '14522', section: 'SIS-02', subject: 'Intro IA', semester: '2025-03', schedules: ['Lu. Vi. 2-5pm'] },
    { id: '3622141', section: 'SIS-03', subject: 'BD',     semester: '2025-03', schedules: ['Lu. Vi. 2-5pm'] },
  ];

  private readonly pending: TeacherClassRow[] = [
    { id: '25356', section: 'SIS-01', subject: 'Redes',   semester: '2025-03', schedules: ['Lu. Mi. 8-10am', 'Lu. Vi. 2-5pm'] },
    { id: '14522', section: 'SIS-02', subject: 'Intro IA', semester: '2025-03', schedules: ['Lu. Vi. 2-5pm'] },
    { id: '3622141', section: 'SIS-03', subject: 'BD',     semester: '2025-03', schedules: ['Lu. Vi. 2-5pm'] },
  ];

  getAccepted(): Observable<TeacherClassRow[]> {
    return of(this.accepted).pipe(delay(150));
  }

  getPending(): Observable<TeacherClassRow[]> {
    return of(this.pending).pipe(delay(150));
  }
}
