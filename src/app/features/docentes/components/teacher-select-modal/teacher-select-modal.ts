import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TeacherAssignmentService } from '../../../planificacion/services/teacher-assignment.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Docente } from '../../models/docente.model';
import { ConfirmationTeachers } from '../confirmation-teachers/confirmation-teachers';
import { HourLimitWarning } from '../hour-limit-warning/hour-limit-warning';
import { SelectedTeachers } from '../../../planificacion/services/selected-teachers';
import { TeacherSelectModalUtil } from './teacher-select-modal.util';

@Component({
  selector: 'app-teacher-select-modal',
  imports: [CommonModule, FormsModule, ConfirmationTeachers, HourLimitWarning],
  templateUrl: './teacher-select-modal.html',
  styleUrls: ['./teacher-select-modal.scss']
})
export class TeacherSelectModal {
  @Input() docente: Docente | null = null;
  @Input() showModal: boolean = false;
  @Input() classKey: string = '';
  @Input() classInfo: any = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() docenteSelected = new EventEmitter<Docente>();
  @Output() showConfirmation = new EventEmitter<Docente>();

  nuevaObservacion: string = '';
  showConfirmationModal: boolean = false;
  showHourWarningModal: boolean = false;
  selectedDocentes: Docente[] = [];
  workHoursToAssign: number = 4; // Horas por defecto para una clase

  // Estado para advertencia de horas extra
  showExtraWarningModal: boolean = false;
  extraWarningData: any = null;
  acceptExtra: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly selectedTeachersService: SelectedTeachers,
    private readonly teacherAssignmentService: TeacherAssignmentService,
    private readonly http: HttpClient,
    private readonly teacherSelectModalUtil: TeacherSelectModalUtil
  ) {}

  get hasClasses(): boolean {
    return !!(this.docente?.classes && this.docente.classes.length > 0);
  }

  get hasObservaciones(): boolean {
    return !!(this.docente?.observaciones && this.docente.observaciones.length > 0);
  }

  get clases() {
    return this.docente?.classes || [];
  }

  get observaciones() {
    return this.docente?.observaciones || [];
  }

  closeModal() {
    this.modalClosed.emit();
  }

  async selectDocente() {
    if (!this.docente) return;
    let maxHours = 40;
    if (typeof this.docente.maxHours === 'number' && this.docente.maxHours > 0) {
      maxHours = this.docente.maxHours;
    }
    // employment_type_id puede venir como contractType o similar, ajusta según tu modelo
    const employmentTypeId = (this.docente as any).employment_type_id || (this.docente as any).employmentTypeId || 1;
    const assignedHours = await this.teacherSelectModalUtil.getAssignedHoursForTeacher(
      this.docente.id!, employmentTypeId
    );
    const toAssign = typeof this.workHoursToAssign === 'number' ? this.workHoursToAssign : 0;
    const currentSum = assignedHours + toAssign;

    // Logging después de inicialización
    console.log('[LOG][SELECCIÓN DOCENTE] maxHours recibido:', maxHours);
    console.log('[LOG][SELECCIÓN DOCENTE] assignedHours:', assignedHours);
    console.log('[LOG][SELECCIÓN DOCENTE] workHoursToAssign:', toAssign);
    console.log('[LOG][SELECCIÓN DOCENTE] sumatoria (assigned + toAssign):', currentSum);
    if (currentSum > maxHours) {
      const excedente = currentSum - maxHours;
      console.log('[LOG][SELECCIÓN DOCENTE] EXCESO DE HORAS:', excedente);
      // Mostrar modal de advertencia de horas extra
      this.extraWarningData = {
        maxHours,
        assignedHours,
        currentSum,
        excessHours: excedente
      };
      this.showExtraWarningModal = true;
      return;
    }
    // Si no excede, continuar normalmente
    this.proceedWithSelection();
  }
  // Acciones del modal de advertencia de horas extra
  onExtraWarningAccept() {
    // LOG de aceptación de horas extra
    if (this.docente) {
      const maxHours = typeof this.docente.maxHours === 'number' ? this.docente.maxHours : 40;
      const assignedHours = typeof this.docente.assignedHours === 'number' ? this.docente.assignedHours : 0;
      const toAssign = typeof this.workHoursToAssign === 'number' ? this.workHoursToAssign : 0;
      const currentSum = assignedHours + toAssign;
      if (currentSum > maxHours) {
        const fullTimeExtraHours = currentSum - maxHours;
        console.log('[LOG][ACEPTAR HORAS EXTRA] full_time_extra_hours que se enviaría:', fullTimeExtraHours);
      }
    }
    this.acceptExtra = true;
    this.showExtraWarningModal = false;
    // Mostrar pantalla de confirmación directamente
    if (this.docente) {
      this.showConfirmationModal = true;
      this.selectedDocentes = [this.docente];
    }
  }

  onExtraWarningCancel() {
    this.showExtraWarningModal = false;
    this.acceptExtra = false;
    // No asignar, solo cerrar el modal de advertencia
  }

  private checkTeacherWorkloadAndProceed() {
    if (!this.docente) return;

    const availableHours = this.docente.availableHours || 0;

    // Mostrar advertencia si tiene pocas horas disponibles o si ya está al límite
    if (availableHours <= 4) {
      console.log(`⚠️ Advertencia de horas para ${this.docente.name}:`, {
        maxHours: this.docente.maxHours,
        assignedHours: this.docente.assignedHours,
        availableHours: this.docente.availableHours
      });
      
      this.showHourWarningModal = true;
    } else {
      // Si tiene suficientes horas disponibles, proceder normalmente
      this.proceedWithSelection();
    }
  }

  private proceedWithSelection() {
    if (this.docente) {
      this.showConfirmationModal = true;
      this.selectedDocentes = [this.docente];
    }
  }

  onHourWarningClosed() {
    this.showHourWarningModal = false;
  }

  onHourWarningConfirmed() {
    this.showHourWarningModal = false;
    this.proceedWithSelection();
  }

  onHourWarningCancelled() {
    this.showHourWarningModal = false;
    // No hacer nada, mantener el modal principal abierto
  }

  onConfirmationClosed() {
    this.showConfirmationModal = false;
  }

  onCancelSelection() {
    this.showConfirmationModal = false;
  }

  onAddAnotherTeacher() {
    this.showConfirmationModal = false;
    this.closeModal();
    // Emit event to parent to show docentes page again
    this.showConfirmation.emit(this.docente!);
  }

  onContinueToPlanning(teachers?: Docente[]) {
    this.showConfirmationModal = false;
    // Aquí se realiza la asignación final
    if (this.docente && this.classInfo?.semesterId && this.classInfo?.id) {
      const payload = {
        teacherId: this.docente.id,
        semesterId: this.classInfo.semesterId,
        teacherClassId: null,
        classId: this.classInfo.id,
        assigningWorkHours: this.workHoursToAssign,
        acceptExtra: this.acceptExtra
      };
      const token = localStorage.getItem('accessToken');
      this.http.post<any>(
        `${this.teacherAssignmentService.baseUrl.replace('/api/teacher-assignments','')}/teachers/classes/assign`,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      ).subscribe({
        next: () => {
          // Guardar selección y navegar
          const docentesToSave = teachers || this.selectedDocentes;
          if (docentesToSave.length > 0) {
            const key = this.classKey || `temp-class-${Date.now()}`;
            const classInfoWithIndex = {
              ...this.classInfo,
              rowIndex: this.classInfo?.rowIndex
            };
            this.selectedTeachersService.addSelectedTeachers(key, docentesToSave, classInfoWithIndex);
            this.router.navigate(['/planificacion']);
          }
          this.closeModal();
        },
        error: () => {
          // Manejar error si es necesario
          this.closeModal();
        }
      });
    } else {
      // Guardamos los docentes seleccionados en el servicio y navegamos
      const docentesToSave = teachers || this.selectedDocentes;
      if (docentesToSave.length > 0) {
        const key = this.classKey || `temp-class-${Date.now()}`;
        const classInfoWithIndex = {
          ...this.classInfo,
          rowIndex: this.classInfo?.rowIndex
        };
        this.selectedTeachersService.addSelectedTeachers(key, docentesToSave, classInfoWithIndex);
        this.router.navigate(['/planificacion']);
      }
      this.closeModal();
    }
  }

  agregarObservacion() {
    if (this.nuevaObservacion.trim() && this.docente) {
      this.docente.observaciones ??= [];
      this.docente.observaciones.push(this.nuevaObservacion.trim());
      this.nuevaObservacion = '';
    }
  }

  eliminarObservacion(index: number) {
    if (this.docente?.observaciones) {
      this.docente.observaciones.splice(index, 1);
    }
  }
}