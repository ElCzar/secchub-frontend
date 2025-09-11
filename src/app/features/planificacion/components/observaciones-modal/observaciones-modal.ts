import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-observaciones-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './observaciones-modal.html',
  styleUrls: ['./observaciones-modal.scss']
})
export class ObservacionesModal implements OnChanges {
  @Input() show: boolean = false;
  @Input() observaciones: string[] = [];
  @Input() title: string = 'Observaciones';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string[]>();

  newObs: string = '';
  localObs: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['observaciones']) {
      this.localObs = (this.observaciones || []).slice();
    }
    if (changes['show'] && this.show) {
      // reset newObs when opened
      this.newObs = '';
    }
  }

  addObservation(): void {
    const v = (this.newObs || '').trim();
    if (!v) return;
    this.localObs.push(v);
    this.newObs = '';
  }

  removeObservation(i: number): void {
    this.localObs.splice(i, 1);
  }

  onSave(): void {
    this.save.emit(this.localObs.slice());
    this.close.emit();
  }

  onCancel(): void {
    this.close.emit();
  }
}


