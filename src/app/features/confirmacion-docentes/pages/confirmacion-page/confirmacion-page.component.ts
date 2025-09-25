import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClassesTableComponent } from '../../components/classes-table/classes-table.component';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';
import { TeacherClassRow } from '../../models/class.models';
import { ConfirmacionService } from '../../services/confirmacion.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";


@Component({
  selector: 'app-confirmacion-page',
  standalone: true,
  imports: [CommonModule, ClassesTableComponent, HeaderComponent, ConfirmSendPopupComponent],
  templateUrl: './confirmacion-page.component.html',
  styleUrls: ['./confirmacion-page.component.scss'],
})
export class ConfirmacionPageComponent implements OnInit {
  accepted: TeacherClassRow[] = [];
  pending: TeacherClassRow[] = [];

  // selección de la tabla “por aceptar”
  selectedPending = new Set<string>();
  // per-row pending states received from child table (includes 'review')
  pendingStates: Record<string, 'accept' | 'reject' | 'review' | 'none'> = {};
  // collected comment requests from children: id -> message
  commentRequests: Record<string, string> = {};

  loading = true;
  // controls visibility of the confirm-send popup
  popupVisible = false;

  constructor(private readonly api: ConfirmacionService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.getAccepted().subscribe(a => this.accepted = a);
    this.api.getPending().subscribe(p => {
      this.pending = p;
      this.loading = false;
    });
  }

  onAccept(): void {
  // show confirmation popup before proceeding
  console.log('Pedir confirmación para aceptar:', Array.from(this.selectedPending));
  this.popupVisible = true;
  }

  onReject(): void {
    console.log('RECHAZAR:', Array.from(this.selectedPending));
    this.selectedPending.clear();
  }

  get canSubmit() { return this.selectedPending.size > 0; }
  // Enable submit when there is any selected or any pending state (accept/reject/review) or comment requests
  get canSubmitAny(): boolean {
    if (this.selectedPending.size > 0) return true;
    if (Object.keys(this.commentRequests).length > 0) return true;
    for (const k of Object.keys(this.pendingStates)) {
      if ((this.pendingStates[k] ?? 'none') !== 'none') return true;
    }
    return false;
  }

  // user confirmed in the popup
  onPopupConfirm(): void {
    // process per-row states: accept -> move to accepted; reject -> remove from pending
    const moving: TeacherClassRow[] = [];
    const rejected: string[] = [];
    const reviews: { id: string; message?: string }[] = [];
    const states = this.pendingStates || {};

    this.pending = this.pending.filter(p => {
      const s = states[p.id] ?? (this.selectedPending.has(p.id) ? 'accept' : 'none');
      if (s === 'accept') {
        moving.push(p);
        return false;
      }
      if (s === 'reject') {
        rejected.push(p.id);
        return false;
      }
      if (s === 'review') {
        // keep in pending but record as a review request
        reviews.push({ id: p.id, message: this.commentRequests[p.id] });
        return true;
      }
      return true;
    });

    // append moved rows to accepted
    this.accepted = [...this.accepted, ...moving];
    this.selectedPending.clear();
    this.pendingStates = {};
    this.popupVisible = false;
    console.log('Confirmado envío, filas aceptadas:', moving.map(m => m.id), 'rechazadas:', rejected, 'revisiones:', reviews);
  }

  onPendingStateChange(states: Record<string, 'accept' | 'reject' | 'review' | 'none'>): void {
    this.pendingStates = states || {};
    // keep selectedPending in sync (accepted == selected)
    const newSel = new Set<string>();
    for (const id of Object.keys(this.pendingStates)) {
      if (this.pendingStates[id] === 'accept') newSel.add(id);
    }
    this.selectedPending = newSel;
  }

  onCommentRequest(ev: { id: string; message: string }): void {
    if (!ev || !ev.id) return;
    this.commentRequests[ev.id] = ev.message || '';
    console.log('Solicitud de revisión añadida:', ev.id, ev.message);
  }

  // user declined in the popup
  onPopupDecline(): void {
    this.popupVisible = false;
    console.log('Cancelado envío');
  }
}

