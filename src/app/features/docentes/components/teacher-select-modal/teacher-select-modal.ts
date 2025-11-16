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
    if (!this.docente || !this.docente.id) return;
    
    const teacherId = this.docente.id;
    const toAssign = typeof this.workHoursToAssign === 'number' ? this.workHoursToAssign : 0;
    
    console.log(`📊 Consultando advertencia de horas para docente ${teacherId}, horas a asignar: ${toAssign}`);
    
    // Usar el nuevo endpoint de advertencia de horas extra
    this.teacherAssignmentService.getTeacherExtraHoursWarning(teacherId, toAssign).subscribe({
      next: (data) => {
        console.log('✅ Respuesta de advertencia de horas:', data);
        
        const {
          teacherName,
          maxHours,
          totalAssignedHours,
          workHoursToAssign,
          exceedsMaxHours
        } = data;
        
        const sumaTotal = totalAssignedHours + workHoursToAssign;
        
        // Si no excede el límite de horas, proceder directamente
        if (exceedsMaxHours === 0) {
          console.log('✅ El docente tiene capacidad suficiente, procediendo con la selección');
          this.proceedWithSelection();
          return;
        }
        
        // Si excede, mostrar advertencia
        console.log('⚠️ El docente excede el límite de horas, mostrando advertencia');
        
        // Calcular distribución de horas según el tipo de contrato del docente
        const employmentTypeId = this.docente?.employmentTypeId || 1; // Default a planta
        let horasPlanta = 0;
        let horasCatedra = 0;
        let horasAdjuntNormales = 0;
        let horasAdjuntExtra = 0;
        
        if (employmentTypeId === 1) {
          // PROFESORES DE PLANTA
          const horasDisponiblesPlanta = Math.max(0, maxHours - totalAssignedHours);
          
          if (horasDisponiblesPlanta > 0) {
            // Caso: aún tiene horas de planta disponibles
            horasPlanta = Math.min(workHoursToAssign, horasDisponiblesPlanta);
            horasCatedra = Math.max(0, workHoursToAssign - horasPlanta);
          } else {
            // Caso: ya no tiene horas de planta, todas serán cátedra
            horasCatedra = workHoursToAssign;
          }
        } else if (employmentTypeId === 2) {
          // PROFESORES DE CÁTEDRA/ADJUNTOS
          const horasDisponiblesAdjunt = Math.max(0, maxHours - totalAssignedHours);
          
          if (horasDisponiblesAdjunt > 0) {
            // Caso: aún tiene horas normales disponibles
            horasAdjuntNormales = Math.min(workHoursToAssign, horasDisponiblesAdjunt);
            horasAdjuntExtra = Math.max(0, workHoursToAssign - horasAdjuntNormales);
          } else {
            // Caso: ya no tiene horas normales, todas serán extra
            horasAdjuntExtra = workHoursToAssign;
          }
        }
        
        this.extraWarningData = {
          maxHours,
          assignedHours: totalAssignedHours,
          toAssign: workHoursToAssign,
          name: teacherName,
          horasPlanta,
          horasCatedra,
          horasAdjuntNormales,
          horasAdjuntExtra,
          excessHours: sumaTotal - maxHours,
          employmentTypeId
        };
        
        this.showExtraWarningModal = true;
      },
      error: (err) => {
        console.error('❌ Error consultando advertencia de horas extra:', err);
        alert('Error al consultar la disponibilidad del docente. Por favor, intente nuevamente.');
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
    
    // Guardar selección y navegar (SIN hacer POST aquí, se hará en planificacion-page)
    const docentesToSave = teachers || this.selectedDocentes;
    
    if (docentesToSave.length > 0) {
      // Agregar datos de horas extra al primer docente si hay advertencia
      if (docentesToSave[0] && this.extraWarningData) {
        (docentesToSave[0] as any).extraHoursData = {
          horasPlanta: this.extraWarningData.horasPlanta,
          horasCatedra: this.extraWarningData.horasCatedra,
          horasAdjuntNormales: this.extraWarningData.horasAdjuntNormales,
          horasAdjuntExtra: this.extraWarningData.horasAdjuntExtra,
          employmentTypeId: this.extraWarningData.employmentTypeId
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