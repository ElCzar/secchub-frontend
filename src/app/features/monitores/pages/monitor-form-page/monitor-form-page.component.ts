// src/app/features/monitores/pages/monitor-form/monitor-form-page.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { AvailabilityRow, AvailabilityTableComponent, newAvailabilityRow } from '../../components/availability-table/availability-table.component';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';


@Component({
  selector: 'app-monitor-form-page',
  standalone: true,
  // Si aún NO vas a usar <app-availability-table>, puedes quitarlo de imports
  imports: [CommonModule, FormsModule, HeaderComponent, AvailabilityTableComponent, ConfirmSendPopupComponent],
  templateUrl: './monitor-form-page.component.html',
  styleUrls: ['./monitor-form-page.component.scss'],
})
export class MonitorFormPageComponent {
  /** Catálogos (si luego los conectas al backend, cámbialos por servicios) */
  docTypes = ['CC', 'TI', 'NIT', 'PP', 'RC', 'CE', 'TE'];
  weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  /** Estado de disponibilidad (para el componente reusable) */
  availabilityRows: AvailabilityRow[] = [newAvailabilityRow()];

  /** Estado para controles de radio (binding con ngModel) */
  adminMonitor = false;
  hasBeenMonitor: boolean | null = null;
  /** Mensaje de error visible cuando la validación falla al enviar */
  formError: string | null = null;
  /** Controla la visibilidad del popup de confirmación */
  showConfirmPopup = false;
  private _lastFormEvent: Event | null = null;

  /** Total de horas (sumatoria de la tabla de disponibilidad) */
  get totalAvailabilityHours(): number {
    return this.availabilityRows.reduce((acc, r) => acc + (Number.isFinite(r.total) ? r.total : 0), 0);
  }

  /** Submit simple para tu formulario actual (no reactivo) */
  onSubmit(evt: Event): void {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;

    // Validación nativa del formulario
    const valid = form.checkValidity();
    if (!valid) {
      // Muestra los mensajes nativos de validación y un banner
      form.reportValidity();
      this.formError = 'Por favor, complete todos los campos requeridos antes de enviar.';

      // Intentamos enfocar el primer control inválido para ayudar al usuario
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid && firstInvalid instanceof HTMLElement) {
        firstInvalid.focus();
      }

      return;
    }

    // limpieza y abrir popup de confirmación
    this.formError = null;
    this._lastFormEvent = evt;
    this.showConfirmPopup = true;
  }

  /** Usuario confirmó el envío desde el popup */
  async onConfirmSend(): Promise<void> {
    // cerramos popup
    this.showConfirmPopup = false;

    // Reusar la última referencia al form para construir el payload
    const evt = this._lastFormEvent;
    if (!evt) return;
    const form = (evt.target as HTMLFormElement);

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
      adminMonitor: (form.querySelector<HTMLInputElement>('input[name="adminMonitor"]:checked')?.value ?? 'true') === 'true',
      section: (form.querySelector<HTMLSelectElement>('#section')?.value ?? '').trim(),

      // Tabla de disponibilidad (si usas el componente)
      availability: this.availabilityRows,
      totalHours: this.totalAvailabilityHours,
    };

  console.log('FORM MONITOR → payload listo para enviar (confirmado):', payload);

  // Aquí iría la llamada HTTP al servicio cuando esté disponible.
  // Por ahora limpiamos el form visualmente
    (evt.target as HTMLFormElement).reset();
    this.availabilityRows = [newAvailabilityRow()];
    this.adminMonitor = false;
    this.hasBeenMonitor = null;
    this._lastFormEvent = null;
  }
}
