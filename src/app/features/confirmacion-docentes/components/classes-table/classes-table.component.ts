import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TeacherClassRow } from '../../models/class.models';
import { PopMessage } from '../pop-message/pop-message';

type StateType = 'accept' | 'reject' | 'review' | 'none';

@Component({
  selector: 'app-classes-table',
  standalone: true,
  imports: [CommonModule, PopMessage],
  templateUrl: './classes-table.component.html',
  styleUrls: ['./classes-table.component.scss'],
})
export class ClassesTableComponent implements OnChanges {
  @Input() rows: TeacherClassRow[] = [];
  @Input() selectable = false;                   // muestra u oculta columna “Seleccionar”
  @Input() selectedIds = new Set<string>();      // ids seleccionados (solo cuando selectable=true)

  @Output() selectedIdsChange = new EventEmitter<Set<string>>();
  // emits per-row state: StateType
  @Output() stateChange = new EventEmitter<Record<string, StateType>>();
  // emit when user provides a comment for a review request
  @Output() commentRequest = new EventEmitter<{ id: string; message: string }>();

  // internal per-row state
  private states: Record<string, StateType> = {};
  // timers kept for backwards compatibility; not strictly needed now
  private readonly clickTimers = new Map<string, any>();

  // pop message state
  popVisible = false;
  popTargetId?: string;
  popMessage = '';

  isChecked(id: string): boolean {
    return this.selectedIds.has(id);
  }

  // legacy toggle kept for compatibility but not used by the new click behavior
  toggle(id: string): void {
    if (!this.selectable) return;
    const copy = new Set(this.selectedIds);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    this.selectedIds = copy;
    this.selectedIdsChange.emit(copy);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] && Array.isArray(this.rows)) {
      for (const r of this.rows) {
        if (!this.states[r.id]) this.states[r.id] = 'none';
      }
    }
  }

  getState(id: string): StateType {
    return this.states[id] ?? 'none';
  }

  // handle clicks: use MouseEvent.detail to detect 1/2/3 clicks
  onClick(id: string, event?: MouseEvent): void {
    if (!this.selectable) return;
    event?.preventDefault?.();
    const detail = event?.detail ?? 1;
    let newState: StateType = 'none';
    if (detail >= 3) {
      newState = this.states[id] === 'review' ? 'none' : 'review';
      // open the pop immediately for triple click
      this.setState(id, newState);
      if (newState === 'review') this.openComment(id);
      return;
    }
    // note: do NOT handle detail===2 here; dblclick will call onDblClick
    // single click
    newState = this.states[id] === 'accept' ? 'none' : 'accept';
    this.setState(id, newState);
  }

  // keyboard support: Space or Enter
  onKey(id: string, ev: KeyboardEvent): void {
    const key = ev.key;
    if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
      ev.preventDefault();
      // cycle through states: none -> accept -> reject -> review -> none
      const seq: StateType[] = ['none', 'accept', 'reject', 'review'];
      const cur = this.states[id] ?? 'none';
      const next = seq[(seq.indexOf(cur) + 1) % seq.length];
      this.setState(id, next);
    }
  }

  // keep compatibility with template dblclick binding
  onDblClick(id: string, event?: Event): void {
    if (!this.selectable) return;
    event?.preventDefault?.();
    const newState: StateType = this.states[id] === 'reject' ? 'none' : 'reject';
    this.setState(id, newState);
  }

  openComment(id: string) {
    this.popTargetId = id;
    this.popMessage = '';
    this.popVisible = true;
  }

  onPopMessageChange(msg: string) {
    this.popMessage = msg;
  }

  onPopClose() {
    this.popVisible = false;
    if (this.popTargetId && this.popMessage && this.popMessage.trim().length > 0) {
      this.commentRequest.emit({ id: this.popTargetId, message: this.popMessage.trim() });
    }
    this.popTargetId = undefined;
    this.popMessage = '';
  }

  private setState(id: string, state: StateType) {
    this.states[id] = state;
    // keep selectedIds in sync for backwards compatibility (selected == accepted)
    const copy = new Set(this.selectedIds);
    if (state === 'accept') copy.add(id); else copy.delete(id);
    this.selectedIds = copy;
    this.selectedIdsChange.emit(copy);
    this.stateChange.emit({ ...this.states });
  }

  trackById(_: number, r: TeacherClassRow) { return r.id; }
}

