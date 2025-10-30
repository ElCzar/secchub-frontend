// src/app/features/monitores/pages/monitor-form/monitor-form-page.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { AvailabilityRow, AvailabilityTableComponent, newAvailabilityRow } from '../../components/availability-table/availability-table.component';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';
import { SuccessModal } from '../../../../shared/components/success-modal/success-modal';
import { ErrorModal } from '../../../../shared/components/error-modal/error-modal';
import { ProgramasService, CourseOption } from '../../../formulario-programas/services/programas.service';
import { SectionsService, Section } from '../../../../shared/services/sections.service';
import { StudentApplicationService } from '../../services/student-application.service';
import { UserInformationService } from '../../../../shared/services/user-information.service';
import { ParametricService } from '../../../../shared/services/parametric.service';


@Component({
  selector: 'app-monitor-form-page',
  standalone: true,
  // Si aún NO vas a usar <app-availability-table>, puedes quitarlo de imports
  imports: [CommonModule, FormsModule, HeaderComponent, AvailabilityTableComponent, ConfirmSendPopupComponent, SuccessModal, ErrorModal],
  templateUrl: './monitor-form-page.component.html',
  styleUrls: ['./monitor-form-page.component.scss'],
})
export class MonitorFormPageComponent implements OnInit {
  /** Inyección de servicios */
  private readonly programasService = inject(ProgramasService);
  private readonly sectionsService = inject(SectionsService);
  private readonly studentApplicationService = inject(StudentApplicationService);
  private readonly userInformationService = inject(UserInformationService);
  private readonly parametricService = inject(ParametricService);

  /** Catálogos (si luego los conectas al backend, cámbialos por servicios) */
  docTypes = ['CC', 'TI', 'NIT', 'PP', 'RC', 'CE', 'TE'];
  weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  /** Arrays para las listas desplegables */
  subjects: CourseOption[] = [];
  sections: Section[] = [];
  loadingSubjects = false;
  loadingSections = false;

  /** Estado de disponibilidad (para el componente reusable) */
  availabilityRows: AvailabilityRow[] = [newAvailabilityRow()];

  /** Estado para controles de radio (binding con ngModel) */
  monitorType: 'academic' | 'administrative' = 'academic'; // Por defecto académico
  hasBeenMonitor: boolean | null = null;
  /** Mensaje de error visible cuando la validación falla al enviar */
  formError: string | null = null;
  /** Controla la visibilidad del popup de confirmación */
  showConfirmPopup = false;
  /** Controla si se está enviando el formulario */
  isSubmitting = false;
  /** Controla la visibilidad del modal de éxito */
  showSuccessModal = false;
  showErrorModal = false;
  errorModalMessage = '';
  private _lastFormEvent: Event | null = null;

  /** Propiedades para visualización (no editables) */
  studentId = '0';
  documentType = 'N/A';
  documentNumber = '0';
  firstName = 'N/A';
  lastName = 'N/A';
  institutionalEmail = 'N/A';

  ngOnInit(): void {
    this.loadUserInformation();
    this.loadSubjects();
    this.loadSections();
  }

  /** Cargar información del usuario */
  private loadUserInformation(): void {
    this.userInformationService.getUserInformation().subscribe({
      next: (userInfo) => {
        this.studentId = String(userInfo?.id);
        
        if (userInfo?.documentTypeId) {
          this.parametricService.getDocumentTypeById(userInfo.documentTypeId).subscribe({
            next: (docType) => {
              this.documentType = docType || 'N/A';
            },
            error: () => {
              this.documentType = 'N/A';
            }
          });
        } else {
          this.documentType = 'N/A';
        }
        
        this.documentNumber = userInfo?.documentNumber || '0';
        this.firstName = userInfo?.name || 'N/A';
        this.lastName = userInfo?.lastName || 'N/A';
        this.institutionalEmail = userInfo?.email || 'N/A';
        console.log('Información del usuario cargada:', userInfo);
      },
      error: (error) => {
        console.error('Error cargando información del usuario:', error);
      }
    });
  }

  /** Cargar asignaturas */
  private loadSubjects(): void {
    this.loadingSubjects = true;
    this.programasService.getAllCourseOptions().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.loadingSubjects = false;
        console.log('Asignaturas cargadas:', subjects.length);
      },
      error: (error) => {
        console.error('Error cargando asignaturas:', error);
        this.loadingSubjects = false;
      }
    });
  }

  /** Cargar secciones */
  private loadSections(): void {
    this.loadingSections = true;
    this.sectionsService.getAllSections().subscribe({
      next: (sections) => {
        this.sections = sections;
        this.loadingSections = false;
        console.log('Secciones cargadas:', sections.length);
      },
      error: (error) => {
        console.error('Error cargando secciones:', error);
        this.loadingSections = false;
      }
    });
  }

  /** Total de horas (sumatoria de la tabla de disponibilidad) */
  get totalAvailabilityHours(): number {
    return this.availabilityRows.reduce((acc, r) => acc + (Number.isFinite(r.total) ? r.total : 0), 0);
  }

  /** Convierte formato HH:mm a HH:mm:ss para el backend */
  private formatTimeForBackend(timeStr: string): string {
    if (!timeStr || timeStr.trim() === '') return '';
    
    // Si ya tiene formato HH:mm:ss, lo devuelve tal como está
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeStr;
    }
    
    // Si tiene formato HH:mm, agrega :00
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return timeStr + ':00';
    }
    
    // Si tiene otro formato, intenta parsearlo y reformatearlo
    return timeStr + ':00';
  }

  /** Métodos auxiliares para extraer valores del formulario */
  private getCourseId(form: HTMLFormElement): number | undefined {
    const courseSelect = form.querySelector<HTMLSelectElement>('#subject');
    const value = courseSelect?.value?.trim();
    console.log('CourseId capturado:', value);
    return value && value !== '' ? parseInt(value) || undefined : undefined;
  }

  private getCourseAverage(form: HTMLFormElement): number | undefined {
    const gradeInput = form.querySelector<HTMLInputElement>('#subjectGrade');
    const value = gradeInput?.value?.trim();
    console.log('CourseAverage capturado:', value);
    return value && value !== '' ? parseFloat(value) || undefined : undefined;
  }

  private getCourseTeacher(form: HTMLFormElement): string | undefined {
    const teacherInput = form.querySelector<HTMLInputElement>('#professor');
    const value = teacherInput?.value?.trim();
    console.log('CourseTeacher capturado:', value);
    return value && value !== '' ? value : undefined;
  }

  private getSectionId(form: HTMLFormElement): number | undefined {
    const sectionSelect = form.querySelector<HTMLSelectElement>('#section');
    const value = sectionSelect?.value?.trim();
    console.log('SectionId capturado:', value);
    return value && value !== '' ? parseInt(value) || undefined : undefined;
  }

  /** Submit simple para tu formulario actual (no reactivo) */
  onSubmit(evt: Event): void {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;

    // Validación: debe seleccionar tipo de monitoría (ya está por defecto)
    if (!this.monitorType) {
      this.formError = 'Debe seleccionar el tipo de monitoría.';
      // Hacer scroll hacia arriba para mostrar el mensaje de error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
      // === DATOS PERSONALES ===
      program: (form.querySelector<HTMLInputElement>('#career')?.value ?? '').trim(),
      semester: parseInt((form.querySelector<HTMLInputElement>('#semester')?.value ?? '0').trim()) || 0,
      academicAverage: parseFloat((form.querySelector<HTMLInputElement>('#average')?.value ?? '0').trim()) || 0,
      phoneNumber: (form.querySelector<HTMLInputElement>('#cellphone')?.value ?? '').trim(),
      alternatePhoneNumber: (form.querySelector<HTMLInputElement>('#altPhone')?.value ?? '').trim(),
      address: (form.querySelector<HTMLInputElement>('#address')?.value ?? '').trim(),
      personalEmail: (form.querySelector<HTMLInputElement>('#altEmail')?.value ?? '').trim(),
      wasTeachingAssistant: (form.querySelector<HTMLInputElement>('input[name="hasBeenMonitor"]:checked')?.value ?? 'false') === 'true',

      // === MONITOR ACADÉMICO (solo si es académico) ===
      courseId: this.monitorType === 'academic' ? this.getCourseId(form) : undefined,
      courseAverage: this.monitorType === 'academic' ? this.getCourseAverage(form) : undefined,
      courseTeacher: this.monitorType === 'academic' ? this.getCourseTeacher(form) : undefined,

      // === MONITOR ADMINISTRATIVO (solo si es administrativo) ===
      sectionId: this.monitorType === 'administrative' ? this.getSectionId(form) : undefined,

      // === HORARIOS ===
      schedules: this.availabilityRows.map(row => {
        const schedule = {
          day: row.day,
          startTime: this.formatTimeForBackend(row.start),
          endTime: this.formatTimeForBackend(row.end)
        };
        console.log('Transformando horario:', row, '→', schedule);
        return schedule;
      })
    };

    console.log('FORM MONITOR → payload listo para enviar (confirmado):', payload);

    // Activar estado de carga
    this.isSubmitting = true;

    // Enviar al backend
    this.studentApplicationService.submitApplication(payload).subscribe({
      next: (response) => {
        console.log('Solicitud enviada exitosamente:', response);
        
        // Desactivar estado de carga
        this.isSubmitting = false;
        
        // Limpiar formulario después de envío exitoso
        (evt.target as HTMLFormElement).reset();
        this.availabilityRows = [newAvailabilityRow()];
        this.monitorType = 'academic'; // Resetear a valor por defecto
        this.hasBeenMonitor = null;
        this._lastFormEvent = null;
        
        // Mostrar modal de éxito
        this.showSuccessModal = true;
      },
      error: (error) => {
        console.error('Error enviando solicitud:', error);
        
        // Desactivar estado de carga
        this.isSubmitting = false;
        
        // Si el backend envía un mensaje específico (p. ej. duplicado), mostrarlo en popup
        const backendMessage = error?.error?.message || error?.message || 'Error enviando la solicitud. Por favor, intente nuevamente.';
        this.errorModalMessage = backendMessage;
        this.showErrorModal = true;
        this.formError = null;
      }
    });
  }

  onErrorModalClose(): void {
    this.showErrorModal = false;
  }

  /** Cerrar modal de éxito */
  onSuccessModalClose(): void {
    this.showSuccessModal = false;
  }
}
