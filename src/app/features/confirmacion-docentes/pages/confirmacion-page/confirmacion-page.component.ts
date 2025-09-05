import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClassesTableComponent } from '../../components/classes-table/classes-table.component';
import { TeacherClassRow } from '../../models/class.models';
import { ConfirmacionService } from '../../services/confirmacion.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";


@Component({
  selector: 'app-confirmacion-page',
  standalone: true,
  imports: [CommonModule, ClassesTableComponent, HeaderComponent],
  templateUrl: './confirmacion-page.component.html',
  styleUrls: ['./confirmacion-page.component.scss'],
})
export class ConfirmacionPageComponent implements OnInit {
  accepted: TeacherClassRow[] = [];
  pending: TeacherClassRow[] = [];

  // selección de la tabla “por aceptar”
  selectedPending = new Set<string>();

  loading = true;

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
    // aquí luego llamas backend
    console.log('ACEPTAR:', Array.from(this.selectedPending));
    this.selectedPending.clear();
  }

  onReject(): void {
    console.log('RECHAZAR:', Array.from(this.selectedPending));
    this.selectedPending.clear();
  }

  get canSubmit() { return this.selectedPending.size > 0; }
}

