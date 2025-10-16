import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Monitor } from '../../model/monitor.model';

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
    const idStr = (monitor.id || 0).toString();
    return `544${idStr.padStart(5, '0')}`;
  }

  // Generar número de clase basado en ID
  getNumeroClase(monitor: Monitor): string {
    const idStr = (monitor.id || 0).toString();
    return `102${idStr.padStart(3, '0')}`;
  }

  // Generar teléfono ficticio
  getTelefono(monitor: Monitor): string {
    const idStr = (monitor.id || 0).toString();
    return `32154798${idStr.slice(-2).padStart(2, '0')}`;
  }

  // Generar correo alternativo
  getCorreoAlternativo(monitor: Monitor): string {
    const nombre = monitor.nombre?.toLowerCase() || 'monitor';
    return `${nombre}@gmail.com`;
  }

  // Generar dirección ficticia
  getDireccion(monitor: Monitor): string {
    const idStr = (monitor.id || 0).toString();
    return `Car 58#5-${idStr.slice(-1)}`;
  }

  // Generar celular institucional
  getCelularInstitucional(monitor: Monitor): string {
    const baseTelefono = this.getTelefono(monitor);
    const idNum = monitor.id || 0;
    const suffix = (idNum + 10).toString().slice(-2);
    return baseTelefono.slice(0, -2) + suffix;
  }
}
