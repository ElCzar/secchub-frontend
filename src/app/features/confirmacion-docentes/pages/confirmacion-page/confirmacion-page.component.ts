import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClassesTableComponent } from '../../components/classes-table/classes-table.component';
import { ConfirmSendPopupComponent } from '../../../../shared/components/confirm-send-popup/confirm-send-popup.component';
import { TeacherClassRow } from '../../models/class.models';
import { ConfirmacionService } from '../../services/confirmacion.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { ManualConfirmacion } from '../../components/manual-confirmacion/manual-confirmacion';


@Component({
  selector: 'app-confirmacion-page',
  standalone: true,
  imports: [CommonModule, ClassesTableComponent, HeaderComponent, ConfirmSendPopupComponent, ManualConfirmacion],
  templateUrl: './confirmacion-page.component.html',
  styleUrls: ['./confirmacion-page.component.scss'],
})
export class ConfirmacionPageComponent implements OnInit {
  accepted: TeacherClassRow[] = [];
  pending: TeacherClassRow[] = [];

  // selección de la tabla “por aceptar”
  selectedPending = new Set<string>();

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

  // user confirmed in the popup
  onPopupConfirm(): void {
    // simulate accepting: move selected pending rows to accepted
    const ids = new Set(this.selectedPending);
    const moving: TeacherClassRow[] = [];
    this.pending = this.pending.filter(p => {
      if (ids.has(p.id)) {
        moving.push(p);
        return false;
      }
      return true;
    });
    // append moved rows to accepted
    this.accepted = [...this.accepted, ...moving];
    this.selectedPending.clear();
    this.popupVisible = false;
    console.log('Confirmado envío, filas aceptadas:', moving.map(m => m.id));
  }

  // user declined in the popup
  onPopupDecline(): void {
    this.popupVisible = false;
    console.log('Cancelado envío');
  }
}

