import { Component, OnInit } from '@angular/core';
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
export class PlanificacionClasesPage implements OnInit {
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

  ngOnInit() {
    // Asegurar que siempre haya una fila editable al iniciar
    this.ensureEditableRow();
  }

  private ensureEditableRow() {
    // Solo agregar una fila nueva si NO hay filas en absoluto
    if (this.rows.length === 0) {
      this.addNewEditableRow();
    }
    // No agregamos fila automáticamente si ya hay filas existentes
  }

  private addNewEditableRow() {
    const newRow: PlanningRow = {
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
      _editing: true // Nueva fila siempre en modo edición
    };
    this.rows.push(newRow);
  }

  // Botones superiores (sin acción aún)
  planAnterior() {}
  aplicarPlaneacion() {}

  onPatchRow(e: { index: number; data: Partial<PlanningRow> }) {
    Object.assign(this.rows[e.index], e.data);
  }
  
  onAddRow() {
    // Agregar una nueva fila en modo edición
    this.addNewEditableRow();
  }
  
  onRemoveRow(i: number) {
    this.rows = this.rows.filter((_, idx) => idx !== i);
    // Después de eliminar, asegurar que haya una fila editable
    this.ensureEditableRow();
  }

  // Guardar cambios (luego conectamos backend)
  guardar() { console.log('Guardar (mock)', this.rows); }
}
