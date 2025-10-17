import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarToggleButtonComponent } from "../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button";
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";
import { LogAuditoriaTable } from '../../components/log-auditoria-table/log-auditoria-table';
import { LogAuditoriaService } from '../../services/log-auditoria.service';

// Interface para las entradas del log
export interface LogEntry {
  id: number;
  usuario: string;
  accion: string;
  descripcion: string;
  fecha: string;
  hora: string;
}

@Component({
  selector: 'app-log-auditoria-page',
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent, 
    SidebarToggleButtonComponent, 
    AccesosRapidosAdmi,
    LogAuditoriaTable
  ],
  templateUrl: './log-auditoria-page.html',
  styleUrl: './log-auditoria-page.scss'
})
export class LogAuditoriaPage implements OnInit {
  // Datos del log
  logEntries: LogEntry[] = [];
  filteredLogEntries: LogEntry[] = [];
  
  // Estado de carga
  loading = false;
  
  // Filtros
  searchTerm = '';
  usuarioFilter = '';
  fechaFilter = '';
  horaFilter = '';
  availableUsuarios: string[] = [];
  availableHoras: string[] = [];

  constructor(
    private readonly logAuditoriaService: LogAuditoriaService
  ) {}

  ngOnInit(): void {
    this.loadLogEntries();
  }

  loadLogEntries(): void {
    this.loading = true;
    
    // Usar el servicio simulado
    this.logAuditoriaService.getAllLogEntries().subscribe({
      next: (entries) => {
        this.logEntries = entries;
        this.extractAvailableUsuarios();
        this.extractAvailableHoras();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading log entries:', error);
        this.loading = false;
      }
    });

  }

  private extractAvailableUsuarios(): void {
    const usuarios = this.logEntries
      .map(entry => entry.usuario)
      .filter((usuario, index, array) => array.indexOf(usuario) === index);
    
    this.availableUsuarios = usuarios;
  }

  private extractAvailableHoras(): void {
    const horas = this.logEntries
      .map(entry => entry.hora)
      .filter((hora, index, array) => array.indexOf(hora) === index)
      .sort((a, b) => a.localeCompare(b));
    
    this.availableHoras = horas;
  }

  applyFilters(): void {
    let filtered = [...this.logEntries];

    // Filtro de búsqueda
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.usuario.toLowerCase().includes(searchLower) ||
        entry.accion.toLowerCase().includes(searchLower) ||
        entry.descripcion.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por usuario
    if (this.usuarioFilter) {
      filtered = filtered.filter(entry => entry.usuario === this.usuarioFilter);
    }

    // Filtro por fecha
    if (this.fechaFilter) {
      filtered = filtered.filter(entry => {
        const entryDate = this.parseDate(entry.fecha);
        const filterDate = new Date(this.fechaFilter);
        return entryDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filtro por hora
    if (this.horaFilter) {
      filtered = filtered.filter(entry => entry.hora === this.horaFilter);
    }

    this.filteredLogEntries = filtered;
  }

  private parseDate(dateString: string): Date {
    // Convertir formato DD/MM/YYYY a Date
    const parts = dateString.split('/');
    return new Date(Number.parseInt(parts[2]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[0]));
  }
}
