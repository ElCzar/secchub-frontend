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
import { firstValueFrom } from 'rxjs';

// Shared Components
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';

// Feature Components - New structure
// Components
import { UserCardContainerComponent } from '../../components/user-card-container/user-card-container.component';

// Shared Services and Models
import { UserInformationService } from '../../../../shared/services/user-information.service';
import { UserInformationResponseDTO } from '../../../../shared/model/dto/user/UserInformationResponseDTO.model';
import { ParametricService } from '../../../../shared/services/parametric.service';
import { SectionInformationService } from '../../../../shared/services/section-information.service';
import { RoleDTO, StatusDTO, DocumentTypeDTO } from '../../../../shared/model/dto/parametric';
import { SectionResponseDTO } from '../../../../shared/model/dto/admin/SectionResponseDTO.model';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarToggleButtonComponent } from "../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button";

// Enhanced User interface for display
interface EnhancedUser extends UserInformationResponseDTO {
  roleName?: string;
  statusName?: string;
  documentTypeName?: string;
  sectionName?: string;
}

// Filter interfaces
interface UserFilter {
  roleName?: string;
  statusName?: string;
  searchTerm?: string;
  sectionId?: number;
}

interface FilterOption {
  id: string | number;
  name: string;
  count?: number;
}

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
  allUsers: EnhancedUser[] = [];
  
  /**
   * Lista filtrada de usuarios que se muestra en la interfaz
   */
  filteredUsers: EnhancedUser[] = [];
  
  /**
   * Indica si está cargando datos del servidor
   */
  loading: boolean = false;

  // ================== DATOS PARAMETRICOS ==================
  
  /**
   * Lista de roles disponibles
   */
  roles: RoleDTO[] = [];
  
  /**
   * Lista de estados disponibles
   */
  statuses: StatusDTO[] = [];
  
  /**
   * Lista de tipos de documento disponibles
   */
  documentTypes: DocumentTypeDTO[] = [];
  
  /**
   * Lista de secciones disponibles
   */
  sections: SectionResponseDTO[] = [];

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
   * Filtro por estado del usuario seleccionado
   */
  statusFilter: string = '';
  
  /**
   * Filtro por sección seleccionada
   */
  sectionFilter: string = '';

  // ================== OPCIONES DE FILTROS ==================
  
  /**
   * Opciones disponibles para filtrar por rol
   */
  roleOptions: FilterOption[] = [];
  
  /**
   * Opciones disponibles para filtrar por estado
   */
  statusOptions: FilterOption[] = [];
  
  /**
   * Opciones disponibles para filtrar por sección
   */
  sectionOptions: FilterOption[] = [];

  // ================== CONFIGURACIÓN DE COMPONENTES ==================
  
  /**
   * Acciones disponibles para las tarjetas de usuario
   */
  cardActions = {
    onView: (user: any) => this.onUserSelected(user),
    onEdit: (user: any) => this.onEditUser(user),
    onDelete: (user: any) => this.onDeleteUser(user)
  };

  // ================== CONSTRUCTOR ==================
  
  constructor(
    private readonly userInformationService: UserInformationService,
    private readonly parametricService: ParametricService,
    private readonly sectionInformationService: SectionInformationService
  ) {}

  ngOnInit(): void {
    this.loadParametricData();
    this.loadUsers();
  }

  /**
   * Load parametric data first (roles, statuses, sections)
   */
  loadParametricData(): void {
    this.loading = true;
    
    // Load all parametric data in parallel
    Promise.all([
      firstValueFrom(this.parametricService.getAllRoles()),
      firstValueFrom(this.parametricService.getAllStatuses()),
      firstValueFrom(this.parametricService.getAllDocumentTypes()),
      firstValueFrom(this.sectionInformationService.findAllSections())
    ]).then(([roles, statuses, documentTypes, sections]) => {
      this.roles = roles || [];
      this.statuses = statuses || [];
      this.documentTypes = documentTypes || [];
      this.sections = sections || [];
      console.log('Parametric data loaded:', { roles: this.roles, statuses: this.statuses, sections: this.sections });
      console.log('Role mappings:', {
        admin: this.getAdminRoleName(),
        teacher: this.getTeacherRoleName(),
        sectionHead: this.getSectionHeadRoleName()
      });
    }).catch(error => {
      console.error('Error loading parametric data:', error);
    });
  }

  /**
   * Load all users from service
   */
  loadUsers(): void {
    this.loading = true;
    
    this.userInformationService.getAllUsersInformation().subscribe({
      next: (users: UserInformationResponseDTO[]) => {
        this.allUsers = this.enhanceUsersWithParametricData(users);
        this.filteredUsers = [...this.allUsers];
        this.generateFilterOptions();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.loading = false;
        // Show error message to user (implement notification service)
        alert('Error al cargar los usuarios. Por favor, intente nuevamente.');
      }
    });
  }

  /**
   * Enhance users with parametric data for display
   */
  private enhanceUsersWithParametricData(users: UserInformationResponseDTO[]): EnhancedUser[] {
    return users.map(user => {
      const role = this.roles.find(r => r.id === user.roleId);
      const status = this.statuses.find(s => s.id === user.statusId);
      const docType = this.documentTypes.find(dt => dt.id === user.documentTypeId);
      
      return {
        ...user,
        roleName: role?.name || 'Sin rol',
        statusName: status?.name || 'Sin estado',
        documentTypeName: docType?.name || 'Sin tipo documento',
        sectionName: undefined // Sections are not directly linked to users in current model
      };
    });
  }

  /**
   * Generate filter options from current users
   */
  generateFilterOptions(): void {
    // Generate role options from parametric data - count by role name
    this.roleOptions = this.roles.map(role => ({
      id: role.id,
      name: role.name,
      count: this.allUsers.filter(user => user.roleName === role.name).length
    }));

    // Generate status options from parametric data - count by status name
    this.statusOptions = this.statuses.map(status => ({
      id: status.id,
      name: status.name,
      count: this.allUsers.filter(user => user.statusName === status.name).length
    }));

    // Generate section options from parametric data
    this.sectionOptions = this.sections.map(section => ({
      id: section.id,
      name: section.name,
      count: 0 // Sections not directly linked to users yet
    }));
  }

  /**
   * Apply all filters
   */
  applyFilters(): void {
    // Get role and status names from selected filter values
    const selectedRole = this.roleFilter ? this.roles.find(r => r.id === Number(this.roleFilter)) : undefined;
    const selectedStatus = this.statusFilter ? this.statuses.find(s => s.id === Number(this.statusFilter)) : undefined;
    
    this.currentFilter = {
      searchTerm: this.searchText.trim() || undefined,
      roleName: selectedRole?.name || undefined,
      statusName: selectedStatus?.name || undefined,
      sectionId: Number(this.sectionFilter) || undefined
    };

    this.filteredUsers = this.filterUsers(this.allUsers, this.currentFilter);
  }

  /**
   * Filter users based on criteria
   */
  private filterUsers(users: EnhancedUser[], filter: UserFilter): EnhancedUser[] {
    return users.filter(user => {
      // Filter by role name
      if (filter.roleName && user.roleName !== filter.roleName) {
        return false;
      }

      // Filter by status name
      if (filter.statusName && user.statusName !== filter.statusName) {
        return false;
      }

      // Filter by search term (name, email, document)
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesSearch = 
          user.name.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.documentNumber.includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          return false;
        }
      }

      // Filter by section (if implemented)
      if (filter.sectionId) {
        // Section filtering would go here when sections are linked to users
        return true;
      }

      return true;
    });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchText = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.sectionFilter = '';
    this.currentFilter = {};
    this.filteredUsers = [...this.allUsers];
  }

  /**
   * Handle user selection
   */
  onUserSelected(user: EnhancedUser): void {
    console.log('Usuario seleccionado:', user);
    // Implement user detail view or actions (navigate to detail page)
    // Example: this.router.navigate(['/ver-registrados/detalle', user.id]);
  }

  /**
   * Handle edit user
   */
  onEditUser(user: EnhancedUser): void {
    console.log('Editar usuario:', user);
    
    // Por ahora mostramos la información del usuario
    const userInfo = `
    Editar Usuario:
    - Nombre: ${user.name} ${user.lastName}
    - Email: ${user.email}
    - Rol: ${user.roleName}
    - ID: ${user.id}
        `;
    
    alert(userInfo + '\n\nFuncionalidad de edición próximamente disponible.');
    
    // Futuro: Implementar navegación a formulario de edición
    // this.router.navigate(['/ver-registrados/editar', user.id]);
  }

  /**
   * Handle delete user
   */
  onDeleteUser(user: EnhancedUser): void {
    console.log('Eliminar usuario:', user);
    // Show confirmation dialog and delete user
    const confirmed = confirm(`¿Está seguro de que desea eliminar al usuario ${user.name} ${user.lastName}?`);
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
   * Get count by role name for statistics
   */
  getUserCountByRole(roleName: string): number {
    return this.allUsers.filter(user => user.roleName === roleName).length;
  }

  /**
   * Get role name that corresponds to administrators
   */
  getAdminRoleName(): string {
    // Look for common admin role patterns
    const adminRole = this.roles.find(role => 
      role.name?.toLowerCase().includes('admin') || 
      role.name?.toLowerCase().includes('administrador')
    );
    return adminRole?.name || 'ROLE_ADMIN';
  }

  /**
   * Get role name that corresponds to teachers
   */
  getTeacherRoleName(): string {
    // Look for common teacher role patterns
    const teacherRole = this.roles.find(role => 
      role.name?.toLowerCase().includes('teacher') || 
      role.name?.toLowerCase().includes('docente') ||
      role.name?.toLowerCase().includes('profesor')
    );
    return teacherRole?.name || 'ROLE_TEACHER';
  }

  /**
   * Get role name that corresponds to section heads
   */
  getSectionHeadRoleName(): string {
    // Look for common section head role patterns
    const sectionHeadRole = this.roles.find(role => 
      role.name?.toLowerCase().includes('section') || 
      role.name?.toLowerCase().includes('jefe') ||
      role.name?.toLowerCase().includes('head') ||
      role.name?.toLowerCase().includes('coordinador')
    );
    return sectionHeadRole?.name || 'ROLE_SECTION_HEAD';
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByUserId(index: number, user: EnhancedUser): number {
    return user.id;
  }
}
