import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarToggleButtonComponent } from "../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button";
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";
import { LogAuditoriaTable } from '../../components/log-auditoria-table/log-auditoria-table';
import { LogAuditoriaService } from '../../services/log-auditoria.service';
import { AuditLogResponseDTO } from '../../../../shared/model/dto/log/AuditLogResponseDTO.model';

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
  logEntries: AuditLogResponseDTO[] = [];
  filteredLogEntries: AuditLogResponseDTO[] = [];

  // Estado de carga
  loading = false;
  
  // Paginación
  currentPage = 0;
  pageSize = 50;
  totalEntries = 0;
  hasMorePages = true;
  
  // Filtros
  searchTerm = '';
  usuarioFilter = '';
  accionFilter = '';
  fechaFilter = '';
  horaFilter = '';
  availableUsuarios: string[] = [];
  availableAcciones: string[] = [];
  availableHoras: string[] = [];

  constructor(
    private readonly logAuditoriaService: LogAuditoriaService
  ) {}

  ngOnInit(): void {
    this.loadLogEntries();
    this.loadAvailableFilters();
  }

  /**
   * Carga los filtros disponibles usando los endpoints específicos
   */
  loadAvailableFilters(): void {
    // Load all unique emails
    this.logAuditoriaService.getAllLogEntries().subscribe({
      next: (entries) => {
        // Extract unique emails
        const emails = entries
          .map(entry => entry.email)
          .filter((email, index, array) => array.indexOf(email) === index)
          .sort((a, b) => a.localeCompare(b));
        this.availableUsuarios = emails;

        // Extract unique actions
        const actions = entries
          .map(entry => entry.action)
          .filter((action, index, array) => array.indexOf(action) === index)
          .sort((a, b) => a.localeCompare(b));
        this.availableAcciones = actions;
      },
      error: (error) => {
        console.error('Error loading available filters:', error);
      }
    });
  }

  loadLogEntries(): void {
    this.loading = true;
    
    // Convert fecha filter to dd/MM/yyyy format if present
    const dateFilter = this.fechaFilter ? this.convertToddMMyyyyFormat(this.fechaFilter) : undefined;
    
    // Use pagination with filters
    this.logAuditoriaService.getLogEntries(
      this.currentPage,
      this.pageSize,
      this.accionFilter || undefined,
      dateFilter
    ).subscribe({
      next: (entries) => {
        this.logEntries = entries;
        // Check if there are more pages (if we got less than pageSize, no more pages)
        this.hasMorePages = entries.length >= this.pageSize;
        this.extractAvailableFilters();
        this.applyClientSideFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading log entries:', error);
        this.loading = false;
      }
    });
  }

  private convertToddMMyyyyFormat(isoDate: string): string {
    // Convert from yyyy-MM-dd (HTML date input) to dd/MM/yyyy
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private extractDateFromTimestamp(timestamp: string): string {
    // Extract date from timestamp format (assuming ISO 8601 or similar)
    // Example: "2024-01-15T14:30:00" -> "15/01/2024"
    try {
      const date = new Date(timestamp);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }

  private extractTimeFromTimestamp(timestamp: string): string {
    // Extract time from timestamp
    // Example: "2024-01-15T14:30:00" -> "14:30"
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  private extractAvailableFilters(): void {
    // Extract unique usuarios (emails)
    const usuarios = this.logEntries
      .map(entry => entry.email)
      .filter((email, index, array) => array.indexOf(email) === index)
      .sort((a, b) => a.localeCompare(b));
    this.availableUsuarios = usuarios;

    // Extract unique acciones
    const acciones = this.logEntries
      .map(entry => entry.action)
      .filter((action, index, array) => array.indexOf(action) === index)
      .sort((a, b) => a.localeCompare(b));
    this.availableAcciones = acciones;

    // Extract unique horas from timestamps
    const horas = this.logEntries
      .map(entry => this.extractTimeFromTimestamp(entry.timestamp))
      .filter((hora, index, array) => array.indexOf(hora) === index)
      .sort((a, b) => a.localeCompare(b));
    this.availableHoras = horas;
  }

  applyClientSideFilters(): void {
    let filtered = [...this.logEntries];

    // Filtro de búsqueda (client-side)
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.email.toLowerCase().includes(searchLower) ||
        entry.action.toLowerCase().includes(searchLower) ||
        entry.methodName.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por usuario (client-side)
    if (this.usuarioFilter) {
      filtered = filtered.filter(entry => entry.email === this.usuarioFilter);
    }

    // Filtro por hora (client-side)
    if (this.horaFilter) {
      filtered = filtered.filter(entry => 
        this.extractTimeFromTimestamp(entry.timestamp) === this.horaFilter
      );
    }

    this.filteredLogEntries = filtered;
    this.totalEntries = filtered.length;
  }

  applyFilters(): void {
    // Reset to first page when filters change
    this.currentPage = 0;
    this.loadLogEntries();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadLogEntries();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadLogEntries();
  }

  // Helper method to get formatted date for display
  getFormattedDate(entry: AuditLogResponseDTO): string {
    return this.extractDateFromTimestamp(entry.timestamp);
  }

  // Helper method to get formatted time for display
  getFormattedTime(entry: AuditLogResponseDTO): string {
    return this.extractTimeFromTimestamp(entry.timestamp);
  }
}
