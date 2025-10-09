import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pop-duplicacion-semetre',
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-duplicacion-semetre.html',
  styleUrl: './pop-duplicacion-semetre.scss'
})
export class PopDuplicacionSemetre implements OnInit {
  
  // Semestre seleccionado
  selectedSemester: string = '';
  
  // Lista de semestres disponibles
  availableSemesters: string[] = [];
  
  // Eventos de salida
  @Output() closeModal = new EventEmitter<void>();
  @Output() applySemester = new EventEmitter<string>();
  
  ngOnInit() {
    this.generateAvailableSemesters();
  }
  
  /**
   * Genera la lista de semestres disponibles
   * Formato: YYYY-01 (primer semestre) y YYYY-03 (segundo semestre)
   */
  private generateAvailableSemesters(): void {
    const currentYear = new Date().getFullYear();
    const semesters: string[] = [];
    
    // Generar semestres de los últimos 3 años
    for (let year = currentYear; year >= currentYear - 2; year--) {
      semesters.push(`${year}-01`); // Primer semestre
      semesters.push(`${year}-03`); // Segundo semestre
    }
    
    this.availableSemesters = semesters;
  }
  
  /**
   * Maneja el cambio de selección de semestre
   */
  onSemesterChange(): void {
    // Lógica adicional si es necesaria cuando cambia la selección
    console.log('Semestre seleccionado:', this.selectedSemester);
  }
  
  /**
   * Cierra el popup sin aplicar cambios
   */
  onClose(): void {
    this.closeModal.emit();
  }
  
  /**
   * Aplica la duplicación del semestre seleccionado
   */
  onApply(): void {
    if (this.selectedSemester) {
      this.applySemester.emit(this.selectedSemester);
    }
  }
}
