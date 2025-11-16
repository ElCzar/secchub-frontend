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
  allLogEntries: AuditLogResponseDTO[] = []; // All entries from backend
  logEntries: AuditLogResponseDTO[] = []; // Currently displayed page
  filteredLogEntries: AuditLogResponseDTO[] = [];

  // Estado de carga
  loading = false;
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalEntries = 0;
  totalPages = 0;
  
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
  }

  loadLogEntries(): void {
    this.loading = true;
    
    // Load all entries from backend (since backend doesn't support pagination)
    this.logAuditoriaService.getLogEntries(
      0,
      9999, // Request a large number since backend returns all anyway
      this.accionFilter || undefined,
      this.fechaFilter ? this.convertToddMMyyyyFormat(this.fechaFilter) : undefined
    ).subscribe({
      next: (entries) => {
        // Sort entries from latest to oldest
        entries.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        // Store all entries
        this.allLogEntries = entries;
        this.totalEntries = entries.length;
        this.totalPages = Math.ceil(this.totalEntries / this.pageSize);
        
        // Extract filters from all data
        this.extractAvailableFilters();
        
        // Apply client-side filters and pagination
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
    // Extract unique usuarios (emails) from all entries
    const usuarios = this.allLogEntries
      .map(entry => entry.email)
      .filter((email, index, array) => array.indexOf(email) === index)
      .sort((a, b) => a.localeCompare(b));
    this.availableUsuarios = usuarios;

    // Extract unique acciones from all entries
    const acciones = this.allLogEntries
      .map(entry => entry.action)
      .filter((action, index, array) => array.indexOf(action) === index)
      .sort((a, b) => a.localeCompare(b));
    this.availableAcciones = acciones;

    // Extract unique horas from timestamps
    const horas = this.allLogEntries
      .map(entry => this.extractTimeFromTimestamp(entry.timestamp))
      .filter((hora, index, array) => array.indexOf(hora) === index)
      .sort((a, b) => a.localeCompare(b));
    this.availableHoras = horas;
  }

  applyClientSideFilters(): void {
    let filtered = [...this.allLogEntries];

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

    // Update total after filtering
    this.filteredLogEntries = filtered;
    this.totalEntries = filtered.length;
    this.totalPages = Math.ceil(this.totalEntries / this.pageSize);
    
    // Reset to first page if current page is out of bounds
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages - 1;
    }
    
    // Apply client-side pagination
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.logEntries = filtered.slice(startIndex, endIndex);
  }

  applyFilters(): void {
    // Reset to first page when filters change
    this.currentPage = 0;
    // Reapply client-side filters (don't reload from backend)
    this.applyClientSideFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // Just update the displayed page from filtered data
    this.applyClientSideFilters();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    // Recalculate pagination
    this.applyClientSideFilters();
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
