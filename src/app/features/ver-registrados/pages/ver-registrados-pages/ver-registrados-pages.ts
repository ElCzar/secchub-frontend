/**
 * Componente principal para la gestión y visualización de usuarios registrados
 * 
 * Esta página permite:
 * - Ver listado completo de usuarios registrados (docentes, jefes de sección, administradores)
 * - Filtrar usuarios por rol, estado y búsqueda de texto
 * - Ver estadísticas generales de usuarios
 * - Realizar acciones sobre usuarios individuales (ver, editar, eliminar)
 * 
 * @author Sistema de Gestión Universitaria
 * @version 2.0.0 - Refactorizado con componentes modulares
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Shared Components
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';

// Feature Components - New structure
import { UserCardContainerComponent } from '../../components/user-card-container/user-card-container.component';
import { UserCardActions } from '../../components/base/base-user-card.component';

// Models and Services - Updated imports
import { 
  RegisteredUser, 
  UserFilter, 
  UserRole,
  FilterOption,
  UserRoleLabels 
} from '../../models';
import { RegisteredUsersService } from '../../services/registered-users.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarToggleButtonComponent } from "../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button";

@Component({
  selector: 'app-ver-registrados-pages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserCardContainerComponent,
    HeaderComponent,
    AccesosRapidosAdmi,
    SidebarToggleButtonComponent
],
  templateUrl: './ver-registrados-pages.html',
  styleUrl: './ver-registrados-pages.scss'
})
export class VerRegistradosPages implements OnInit {
  
  // ================== PROPIEDADES DE DATOS ==================
  
  /**
   * Lista completa de usuarios registrados obtenida del backend
   */
  allUsers: RegisteredUser[] = [];
  
  /**
   * Lista filtrada de usuarios que se muestra en la interfaz
   */
  filteredUsers: RegisteredUser[] = [];
  
  /**
   * Indica si está cargando datos del servidor
   */
  loading: boolean = false;

  // ================== PROPIEDADES DE FILTROS ==================
  
  /**
   * Filtro activo actual aplicado a la lista
   */
  currentFilter: UserFilter = {};
  
  /**
   * Texto de búsqueda libre para filtrar usuarios
   */
  searchText: string = '';
  
  /**
   * Filtro por rol de usuario seleccionado
   */
  roleFilter: string = '';
  
  /**
   * Filtro por facultad seleccionada
   */
  facultyFilter: string = '';
  
  /**
   * Filtro por estado del usuario seleccionado
   */
  statusFilter: string = '';

  // ================== OPCIONES DE FILTROS ==================
  
  /**
   * Opciones disponibles para filtrar por rol
   */
  roleOptions: FilterOption[] = [];
  
  /**
   * Opciones disponibles para filtrar por facultad
   */
  facultyOptions: FilterOption[] = [];
  
  /**
   * Opciones disponibles para filtrar por estado
   */
  statusOptions: FilterOption[] = [];

  // ================== CONFIGURACIÓN DE COMPONENTES ==================
  
  /**
   * Acciones disponibles para las tarjetas de usuario
   */
  cardActions: UserCardActions = {
    onView: (user) => this.onUserSelected(user),
    onEdit: (user) => this.onEditUser(user),
    onDelete: (user) => this.onDeleteUser(user)
  };

  // ================== ENUMS PARA TEMPLATE ==================
  
  /**
   * Enum de roles disponible en el template
   */
  UserRole = UserRole;
  
  /**
   * Etiquetas legibles para roles de usuario
   */
  UserRoleLabels = UserRoleLabels;

  // ================== CONSTRUCTOR ==================
  
  constructor(private readonly usersService: RegisteredUsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load all users from service
   */
  loadUsers(): void {
    this.loading = true;
    
    this.usersService.getAllRegisteredUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.filteredUsers = [...users];
        this.generateFilterOptions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.loading = false;
        // Show error message to user (implement notification service)
        alert('Error al cargar los usuarios. Por favor, intente nuevamente.');
      }
    });
  }

  /**
   * Generate filter options from current users
   */
  generateFilterOptions(): void {
    const options = this.usersService.getFilterOptions(this.allUsers);
    this.roleOptions = options.roles;
    this.facultyOptions = options.faculties;
    this.statusOptions = options.statuses;
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    this.currentFilter = {
      searchTerm: this.searchText.trim() || undefined,
      role: this.roleFilter as UserRole || undefined,
      faculty: this.facultyFilter || undefined,
      status: this.statusFilter || undefined
    };

    this.filteredUsers = this.usersService.filterUsers(this.allUsers, this.currentFilter);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchText = '';
    this.roleFilter = '';
    this.facultyFilter = '';
    this.statusFilter = '';
    this.currentFilter = {};
    this.filteredUsers = [...this.allUsers];
  }

  /**
   * Handle user selection
   */
  onUserSelected(user: RegisteredUser): void {
    console.log('Usuario seleccionado:', user);
    // Implement user detail view or actions (navigate to detail page)
    // Example: this.router.navigate(['/ver-registrados/detalle', user.id]);
  }

  /**
   * Handle edit user
   */
  onEditUser(user: RegisteredUser): void {
    console.log('Editar usuario:', user);
    // Navigate to edit user form or open modal
    // Example: this.router.navigate(['/ver-registrados/editar', user.id]);
  }

  /**
   * Handle delete user
   */
  onDeleteUser(user: RegisteredUser): void {
    console.log('Eliminar usuario:', user);
    // Show confirmation dialog and delete user
    const confirmed = confirm(`¿Está seguro de que desea eliminar al usuario ${user.userInfo.name} ${user.userInfo.lastName}?`);
    if (confirmed) {
      // Implement delete logic here
      console.log('Usuario eliminado');
    }
  }

  /**
   * Get total count for statistics
   */
  getTotalUsersCount(): number {
    return this.allUsers.length;
  }

  /**
   * Get filtered count for statistics
   */
  getFilteredUsersCount(): number {
    return this.filteredUsers.length;
  }

  /**
   * Get count by role for statistics
   */
  getUserCountByRole(role: UserRole): number {
    return this.allUsers.filter(user => user.role === role).length;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByUserId(index: number, user: RegisteredUser): number {
    return user.id;
  }
}
