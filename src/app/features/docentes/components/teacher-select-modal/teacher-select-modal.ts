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

  selectDocente() {
    if (!this.docente) return;
    const teacherId = this.docente.id;
    const toAssign = typeof this.workHoursToAssign === 'number' ? this.workHoursToAssign : 0;
    
    this.http.get<any>(`http://localhost:8080/planning/teachers/${teacherId}/max-hours`).subscribe({
      next: (data) => {
        const {
          maxHours,
          assignedHours,
          employmentTypeId,
          exceedsMaxHours,
          name
        } = data;
        const sumaTotal = assignedHours + toAssign;
        
        // Si es profesor de cátedra (employmentTypeId === 2), flujo normal
        if (employmentTypeId === 2) {
          this.proceedWithSelection();
          return;
        }
        
        // Caso: No excede maxHours y es tipo planta
        if (exceedsMaxHours === 0 && employmentTypeId === 1 && sumaTotal <= maxHours) {
          this.proceedWithSelection();
        } else {
          // Modal de advertencia
          let horasPlanta = 0;
          let horasCatedra = 0;
          
          if (exceedsMaxHours === 0 && employmentTypeId === 1 && sumaTotal > maxHours) {
            horasPlanta = Math.max(0, maxHours - assignedHours);
            horasCatedra = toAssign - horasPlanta;
          } else if (exceedsMaxHours === 1 && employmentTypeId === 1) {
            horasPlanta = 0;
            horasCatedra = toAssign;
          }
          
          this.extraWarningData = {
            maxHours,
            assignedHours,
            toAssign,
            name,
            horasPlanta,
            horasCatedra,
            excessHours: sumaTotal - maxHours
          };
          this.showExtraWarningModal = true;
        }
      },
      error: (err) => {
        console.error('Error consultando max-hours:', err);
      }
    });
  }
  // Acciones del modal de advertencia de horas extra
  onExtraWarningAccept() {
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
  this.closeModal();
  // Cierra también el modal principal de asignar
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
  this.closeModal();
  // Cierra también el modal principal de asignar
  }

  onConfirmationClosed() {
  this.showConfirmationModal = false;
  this.closeModal();
  }

  onCancelSelection() {
  this.showConfirmationModal = false;
  this.closeModal();
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
      const token = localStorage.getItem('accessToken');
      
      // Guardar selección y navegar (SIN hacer POST aquí, se hará en planificacion-page)
      const docentesToSave = teachers || this.selectedDocentes;
      
      if (docentesToSave.length > 0) {
        // Agregar datos de horas extra al primer docente si hay advertencia
        if (docentesToSave[0] && this.extraWarningData) {
          (docentesToSave[0] as any).extraHoursData = {
            horasPlanta: this.extraWarningData.horasPlanta,
            horasCatedra: this.extraWarningData.horasCatedra
          };
        }
        
        const key = this.classKey || `temp-class-${Date.now()}`;
        const classInfoWithIndex = {
          ...this.classInfo,
          rowIndex: this.classInfo?.rowIndex
        };
        this.selectedTeachersService.addSelectedTeachers(key, docentesToSave, classInfoWithIndex);
        this.router.navigate(['/planificacion']);
      }
      this.closeModal();
    } else {
      // Guardamos los docentes seleccionados en el servicio y navegamos
      const docentesToSave = teachers || this.selectedDocentes;
      
      if (docentesToSave.length > 0) {
        // Agregar datos de horas extra al primer docente si hay advertencia
        if (docentesToSave[0] && this.extraWarningData) {
          (docentesToSave[0] as any).extraHoursData = {
            horasPlanta: this.extraWarningData.horasPlanta,
            horasCatedra: this.extraWarningData.horasCatedra
          };
        }
        
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