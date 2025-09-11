import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Docente } from '../../models/docente.model';

@Component({
  selector: 'app-docente-card',
  imports: [CommonModule],
  templateUrl: './docente-card.html',
  styleUrls: ['./docente-card.scss']
})
export class DocenteCard {

  @Input() docente: Docente | undefined;
  @Output() selected = new EventEmitter<Docente>();

  onSelect() {
    this.selected.emit(this.docente);
  }

}


