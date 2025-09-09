import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { PlanningRow } from '../../models/planificacion.models';
import { PlanningClassesTable } from "../../components/planning-classes-table/planning-classes-table";

@Component({
  selector: 'app-planificacion-clases-page',
  standalone: true,
  imports: [CommonModule, AccesosRapidosAdmi, AccesosRapidosSeccion, PlanningClassesTable],
  templateUrl: './planificacion-page.html',
  styleUrls: ['./planificacion-page.scss'],
})
export class PlanificacionClasesPageComponent {
  // Simulación de rol; cámbialo cuando conectemos auth
  role: 'admin' | 'seccion' = 'admin';

  // Datos mock (sin backend)
  rows: PlanningRow[] = [
    {
      _state: 'new',
      courseId: '1010',
      courseName: 'Redes',
      section: 'SIS-01',
      classId: '20134',
      seats: 20,
      startDate: '2025-07-21',
      endDate: '2025-11-21',
      weeks: 17,
      teacher: { id: 't1', name: 'Carlos Perez' },
      status: 'PENDIENTE',
      notes: [],
      schedules: [
        { day: 'LUN', startTime: '08:00', endTime: '10:00', disability: false, modality: 'PRESENCIAL', roomType: 'Aulas', room: '' },
      ],
    },
  ];

  // Botones superiores (sin acción aún)
  nuevaClase() {}
  planAnterior() {}
  aplicarPlaneacion() {}

  onPatchRow(e: { index: number; data: Partial<PlanningRow> }) {
    Object.assign(this.rows[e.index], e.data);
  }
  onAddRow() {
    this.rows = [
      ...this.rows,
      {
        _state: 'new',
        courseId: '',
        courseName: '',
        section: '',
        classId: '',
        seats: 0,
        startDate: '',
        endDate: '',
        weeks: 0,
        teacher: undefined,
        status: 'PENDIENTE',
        notes: [],
        schedules: [],
      },
    ];
  }
  onRemoveRow(i: number) {
    this.rows = this.rows.filter((_, idx) => idx !== i);
  }

  // Guardar cambios (luego conectamos backend)
  guardar() { console.log('Guardar (mock)', this.rows); }
}
