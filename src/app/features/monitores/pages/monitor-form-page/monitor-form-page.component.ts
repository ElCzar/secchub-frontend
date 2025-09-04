// src/app/features/monitores/pages/monitor-form/monitor-form-page.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { AvailabilityRow, AvailabilityTableComponent, newAvailabilityRow } from '../../components/availability-table/availability-table.component';


@Component({
  selector: 'app-monitor-form-page',
  standalone: true,
  // Si aún NO vas a usar <app-availability-table>, puedes quitarlo de imports
  imports: [CommonModule, HeaderComponent, AvailabilityTableComponent],
  templateUrl: './monitor-form-page.component.html',
  styleUrls: ['./monitor-form-page.component.scss'],
})
export class MonitorFormPageComponent {
  /** Catálogos (si luego los conectas al backend, cámbialos por servicios) */
  docTypes = ['CC', 'TI', 'NIT', 'PP', 'RC', 'CE', 'TE'];
  weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  /** Estado de disponibilidad (para el componente reusable) */
  availabilityRows: AvailabilityRow[] = [newAvailabilityRow()];

  /** Total de horas (sumatoria de la tabla de disponibilidad) */
  get totalAvailabilityHours(): number {
    return this.availabilityRows.reduce((acc, r) => acc + (Number.isFinite(r.total) ? r.total : 0), 0);
  }

  /** Submit simple para tu formulario actual (no reactivo) */
  onSubmit(evt: Event): void {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;

    // Captura básica de valores (puedes migrar a Reactive Forms cuando quieras)
    const payload = {
      studentId: (form.querySelector<HTMLInputElement>('#studentId')?.value ?? '').trim(),
      documentType: (form.querySelector<HTMLSelectElement>('#documentType')?.value ?? '').trim(),
      documentNumber: (form.querySelector<HTMLInputElement>('#documentNumber')?.value ?? '').trim(),

      firstName: (form.querySelector<HTMLInputElement>('#firstName')?.value ?? '').trim(),
      lastName: (form.querySelector<HTMLInputElement>('#lastName')?.value ?? '').trim(),
      address: (form.querySelector<HTMLInputElement>('#address')?.value ?? '').trim(),
      email: (form.querySelector<HTMLInputElement>('#email')?.value ?? '').trim(),
      altEmail: (form.querySelector<HTMLInputElement>('#altEmail')?.value ?? '').trim(),
      cellphone: (form.querySelector<HTMLInputElement>('#cellphone')?.value ?? '').trim(),
      altPhone: (form.querySelector<HTMLInputElement>('#altPhone')?.value ?? '').trim(),

      career: (form.querySelector<HTMLInputElement>('#career')?.value ?? '').trim(),
      semester: (form.querySelector<HTMLInputElement>('#semester')?.value ?? '').trim(),
      average: (form.querySelector<HTMLInputElement>('#average')?.value ?? '').trim(),

      hasBeenMonitor: (form.querySelector<HTMLInputElement>('input[name="hasBeenMonitor"]:checked')?.value ?? 'false') === 'true',
      adminMonitor: (form.querySelector<HTMLInputElement>('input[name="adminMonitor"]:checked')?.value ?? 'false') === 'true',
      section: (form.querySelector<HTMLSelectElement>('#section')?.value ?? '').trim(),

      // Tabla de disponibilidad (si usas el componente)
      availability: this.availabilityRows,
      totalHours: this.totalAvailabilityHours,
    };

    console.log('FORM MONITOR → payload listo para enviar:', payload);

    // TODO: aquí llamarías a tu servicio HTTP cuando lo conectes al backend:
    // this.monitoresService.create(payload).subscribe(...)
  }
}
