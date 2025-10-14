import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Shared Components
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';

// Feature Components
import { CardsRegistrados } from '../../components/cards-registrados/cards-registrados';

// Models and Services
import { 
  RegisteredUser, 
  UserFilter, 
  UserRole, 
  FilterOption,
  UserRoleLabels 
} from '../../models/user-registered.model';
import { RegisteredUsersService } from '../../services/registered-users.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarToggleButtonComponent } from "../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button";

@Component({
  selector: 'app-ver-registrados-pages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardsRegistrados,
    HeaderComponent,
    AccesosRapidosAdmi,
    SidebarToggleButtonComponent
],
  templateUrl: './ver-registrados-pages.html',
  styleUrl: './ver-registrados-pages.scss'
})
export class VerRegistradosPages implements OnInit {
  // Data properties
  allUsers: RegisteredUser[] = [];
  filteredUsers: RegisteredUser[] = [];
  loading: boolean = false;

  // Filter properties
  currentFilter: UserFilter = {};
  searchText: string = '';
  roleFilter: string = '';
  facultyFilter: string = '';
  statusFilter: string = '';

  // Filter options
  roleOptions: FilterOption[] = [];
  facultyOptions: FilterOption[] = [];
  statusOptions: FilterOption[] = [];

  // Enums for template
  UserRole = UserRole;
  UserRoleLabels = UserRoleLabels;

  constructor(private usersService: RegisteredUsersService) {}

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
        // TODO: Show error message to user
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
    // TODO: Implement user detail view or actions
  }

  /**
   * Handle edit user
   */
  onEditUser(user: RegisteredUser): void {
    console.log('Editar usuario:', user);
    // TODO: Navigate to edit user form or open modal
  }

  /**
   * Handle delete user
   */
  onDeleteUser(user: RegisteredUser): void {
    console.log('Eliminar usuario:', user);
    // TODO: Show confirmation dialog and delete user
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
}
