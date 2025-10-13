import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Monitor } from '../../models/monitor.model';

@Component({
  selector: 'app-pop-exportar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-exportar.html',
  styleUrl: './pop-exportar.scss'
})
export class PopExportar {
  @Input() visible = false;
  @Input() monitores: Monitor[] = [];
  @Input() title = 'Nómina Monitores';
  
  @Output() closed = new EventEmitter<void>();
  @Output() exportar = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }

  onExportar() {
    this.exportar.emit();
  }

  // Generar número de documento ficticio basado en ID
  getDocumentoIdentidad(monitor: Monitor): string {
    return `544${monitor.id.padStart(5, '0')}`;
  }

  // Generar número de clase basado en ID
  getNumeroClase(monitor: Monitor): string {
    return `102${monitor.id.padStart(3, '0')}`;
  }

  // Generar teléfono ficticio
  getTelefono(monitor: Monitor): string {
    return `32154798${monitor.id.slice(-2).padStart(2, '0')}`;
  }

  // Generar correo alternativo
  getCorreoAlternativo(monitor: Monitor): string {
    return `${monitor.nombre.toLowerCase()}@gmail.com`;
  }

  // Generar dirección ficticia
  getDireccion(monitor: Monitor): string {
    return `Car 58#5-${monitor.id.slice(-1)}`;
  }

  // Generar celular institucional
  getCelularInstitucional(monitor: Monitor): string {
    const baseTelefono = this.getTelefono(monitor);
    const idNum = parseInt(monitor.id, 10);
    const suffix = (idNum + 10).toString().slice(-2);
    return baseTelefono.slice(0, -2) + suffix;
  }
}
