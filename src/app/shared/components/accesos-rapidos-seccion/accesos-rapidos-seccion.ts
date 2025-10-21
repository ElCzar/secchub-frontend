import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarToggleService } from '../../services/sidebar-toggle.service';
import { PopPerfilComponent } from '../../../features/perfil/components/pop-perfil/pop-perfil';
import { UserInformationResponseDTO } from '../../model/dto/user/UserInformationResponseDTO.model';

@Component({
  selector: 'app-accesos-rapidos-seccion',
  standalone: true,
  imports: [CommonModule, RouterModule, PopPerfilComponent],
  templateUrl: './accesos-rapidos-seccion.html',
  styleUrls: ['./accesos-rapidos-seccion.scss']
})
export class AccesosRapidosSeccion {
  showProfilePopup = false;

  items = [
    { label: 'Perfil', action: 'profile' },
    { label: 'Inicio', route: '/inicio-seccion' },
    { label: 'Planificar Clases', route: '/planificacion' },
    { label: 'Monitores', route: '/solicitud-monitores' },
    { label: 'Cerrar sesión', route: '/' }
  ];

  constructor(
    private readonly router: Router,
    public readonly sidebarToggleService: SidebarToggleService
  ) {}

  go(item: { label: string; route?: string; action?: string }) {
    if (item.action === 'profile') {
      this.openProfile();
    } else if (item.route) {
      this.router.navigateByUrl(item.route).catch(() => console.warn('Navigation failed', item));
    }
  }

  openProfile() {
    // Mostrar el popup inmediatamente sin cerrar el sidebar
    this.showProfilePopup = true;
    
   
  }

  onCloseProfile() {
    this.showProfilePopup = false;
   
  }

  onProfileUpdated(updatedProfile: UserInformationResponseDTO) {
    console.log('Perfil actualizado:', updatedProfile);
    // Para jefe de sección, esto no debería ejecutarse ya que no pueden editar
    // Pero mantenemos el método por consistencia
  }

  closeSidebar() {
    this.sidebarToggleService.closeSidebar();
  }
}
