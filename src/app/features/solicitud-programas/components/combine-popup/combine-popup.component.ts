import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulesTableComponent } from '../../../../shared/components/schedules-table/schedules-table.component';
import { ScheduleRow, newSchedule } from '../../../programas/models/schedule.models';

interface AvailableSchedule extends ScheduleRow {
  sourceProgram?: string;
  sourceMateria?: string;
  selected?: boolean;
}

@Component({
  selector: 'app-combine-popup',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule, SchedulesTableComponent],
  templateUrl: './combine-popup.component.html',
  styleUrls: ['./combine-popup.component.scss']
})
export class CombinePopupComponent implements OnChanges {
  @Input() visible = false;
  @Input() items: Array<any> = [];
  @Output() combine = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  // Editable cupos (sum by default)
  combinedCupos = 0;
  // All available schedules from the items being combined
  availableSchedules: AvailableSchedule[] = [];
  // Selected schedules that will be used in the combined request
  selectedSchedules: ScheduleRow[] = [];
  // Flag to force table re-render when needed
  showTable = true;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 ngOnChanges called with:', changes);
    
    if (changes['items'] && this.items && this.items.length) {
      console.log('📥 Processing items:', this.items);
      
      this.combinedCupos = this.items.reduce((s, it) => s + (it.cupos || 0), 0);
      console.log('💰 Combined cupos:', this.combinedCupos);
      
      // Collect all schedules from all items being combined
      this.availableSchedules = [];
      this.items.forEach((item, itemIndex) => {
        console.log(`📋 Processing item ${itemIndex}:`, item);
        if (Array.isArray(item.schedules) && item.schedules.length > 0) {
          item.schedules.forEach((schedule: any, scheduleIndex: number) => {
            const availableSchedule = {
              ...schedule,
              sourceProgram: item.program,
              sourceMateria: item.materia,
              selected: false
            };
            console.log(`  📅 Adding schedule ${scheduleIndex}:`, availableSchedule);
            console.log(`  🕐 Schedule times: start=${schedule.startTime}, end=${schedule.endTime}`);
            console.log(`  📊 All schedule fields:`, Object.keys(schedule));
            this.availableSchedules.push(availableSchedule);
          });
        } else {
          console.log(`  ⚠️ Item ${itemIndex} has no schedules or invalid schedules`);
        }
      });

      console.log('📊 Total available schedules:', this.availableSchedules.length);
      console.log('📋 Available schedules:', this.availableSchedules);

      // Initialize selected schedules
      if (this.availableSchedules.length === 0) {
        // If no schedules available, add a new empty schedule
        this.selectedSchedules = [newSchedule()];
        console.log('➕ No available schedules, created empty one');
      } else {
        // Pre-select the first schedule as default and copy it to selectedSchedules
        this.availableSchedules[0].selected = true;
        console.log('✅ Pre-selected first available schedule:', this.availableSchedules[0]);
        
        // Immediately update selected schedules so they're never empty
        this.updateSelectedSchedules();
        
        // Ensure we have valid schedules before the component renders
        console.log('🔍 Final selected schedules after init:', this.selectedSchedules);
      }
    }
    
    if (!this.items || this.items.length === 0) {
      console.log('🧹 Clearing data - no items');
      this.combinedCupos = 0;
      this.availableSchedules = [];
      this.selectedSchedules = [newSchedule()];
    }
  }

  // Update selected schedules based on user selection
  updateSelectedSchedules(): void {
    console.log('🔄 updateSelectedSchedules called');
    console.log('📋 Available schedules:', this.availableSchedules);
    console.log('✅ Currently selected schedules (before update):', this.selectedSchedules);

    const selectedFromAvailable = this.availableSchedules
      .filter(schedule => schedule.selected)
      .map((schedule, index) => {
        console.log(`📋 Mapping selected schedule ${index}:`, schedule);
        console.log(`🕐 Original times: start=${schedule.startTime}, end=${schedule.endTime}`);
        
        const normalizedStartTime = this.normalizeTime(schedule.startTime || '');
        const normalizedEndTime = this.normalizeTime(schedule.endTime || '');
        
        const mappedSchedule: ScheduleRow = {
          day: schedule.day || '',
          startTime: normalizedStartTime,
          endTime: normalizedEndTime,
          disability: schedule.disability || false,
          modality: schedule.modality || 'PRESENCIAL',
          roomType: schedule.roomType || 'Aulas'
        };
        
        console.log(`✅ Mapped schedule ${index}:`, mappedSchedule);
        console.log(`🕐 Normalized times: start=${mappedSchedule.startTime}, end=${mappedSchedule.endTime}`);
        
        return mappedSchedule;
      });

    console.log('🔄 updateSelectedSchedules - Horarios seleccionados desde checkboxes:', selectedFromAvailable);
    console.log('📊 Número de horarios seleccionados:', selectedFromAvailable.length);

    // Solo actualizar si hay horarios seleccionados desde los disponibles
    if (selectedFromAvailable.length > 0) {
      this.selectedSchedules = selectedFromAvailable;
      console.log('✅ Horarios actualizados desde selección:', this.selectedSchedules);
      
      // Forzar re-render de la tabla
      this.forceTableRerender();
      
      // Forzar detección de cambios para asegurar que la tabla se actualice
      this.cdr.detectChanges();
    } else {
      // Si no hay horarios seleccionados, mantener al menos uno vacío solo si no hay ninguno
      if (this.selectedSchedules.length === 0) {
        this.selectedSchedules = [newSchedule()];
        console.log('➕ Agregado horario vacío por defecto (no había ninguno)');
        this.forceTableRerender();
        this.cdr.detectChanges();
      } else {
        console.log('📌 Manteniendo horarios existentes ya que no hay nuevas selecciones');
      }
    }
    
    console.log('🏁 Final selected schedules:', this.selectedSchedules);
  }

  // Toggle schedule selection
  toggleScheduleSelection(index: number): void {
    if (this.availableSchedules[index]) {
      this.availableSchedules[index].selected = !this.availableSchedules[index].selected;
      this.updateSelectedSchedules();
    }
  }

  // Reset selected schedules to match current checkbox selection
  resetToSelectedSchedules(): void {
    console.log('🔄 Reseteando horarios a selección actual');
    console.log('📋 Estado actual de availableSchedules:', this.availableSchedules);
    
    // Forzar actualización desde checkbox selection
    this.updateSelectedSchedules();
    
    // Forzar re-render completo de la tabla
    this.forceTableRerender();
    
    // Forzar detección de cambios para refresh de la tabla
    this.cdr.detectChanges();
    
    console.log('✅ Reset completado, selectedSchedules:', this.selectedSchedules);
  }

  // Force table to re-render by toggling visibility
  private forceTableRerender(): void {
    // Método simplificado - solo forzar detección de cambios
    // El *ngIf en el template ya maneja la recreación cuando es necesario
    this.cdr.markForCheck();
  }

  // Normalize time format to HH:mm
  private normalizeTime(time: string): string {
    if (!time) return '';
    
    // Si ya está en formato HH:mm, devolverlo tal como está
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    
    // Si está en formato HH:mm:ss, quitar los segundos
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5);
    }
    
    // Si es otro formato, intentar parsearlo
    try {
      const date = new Date(`1970-01-01T${time}`);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return time; // Devolver tal como está si no se puede parsear
    }
  }

  confirm(): void {
    console.log('🚀 Confirmando combinación con horarios:', this.selectedSchedules);
    
    // Verificar cada horario antes del envío
    this.selectedSchedules.forEach((schedule, index) => {
      console.log(`📅 Horario ${index}:`, schedule);
      console.log(`  🕐 Tiempos: ${schedule.startTime} - ${schedule.endTime}`);
      console.log(`  📅 Día: ${schedule.day}`);
      console.log(`  🏢 Modalidad: ${schedule.modality}`);
      console.log(`  🚪 Tipo sala: ${schedule.roomType}`);
    });
    
    const payload = {
      programs: this.items.map(i => i.program),
      materias: this.items.map(i => i.materia),
      cupos: this.combinedCupos,
      sourceIds: this.items.map(i => i.id),
      schedules: this.selectedSchedules
    };
    
    console.log('📤 Payload enviado:', payload);
    this.combine.emit(payload);
  }

  close(): void {
    this.closed.emit();
  }

  onSchedulesChange(rows: ScheduleRow[]) {
    console.log('📝 onSchedulesChange - Cambios recibidos desde tabla:', rows);
    
    // Debug cada horario recibido
    rows.forEach((row, index) => {
      console.log(`  📅 Row ${index}:`, row);
      console.log(`    🕐 Times: ${row.startTime} - ${row.endTime}`);
      console.log(`    📅 Day: ${row.day}`);
    });
    
    // Siempre actualizar los horarios seleccionados con los cambios de la tabla
    this.selectedSchedules = rows || [];
    
    // Asegurar que siempre haya al menos un horario
    if (this.selectedSchedules.length === 0) {
      this.selectedSchedules = [newSchedule()];
      console.log('➕ Agregado horario vacío después de cambio');
    }

    console.log('✅ Horarios seleccionados actualizados:', this.selectedSchedules);
  }
}
