import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarToggleService } from '../../services/sidebar-toggle.service';
import { PopPerfilComponent } from '../../../features/perfil/components/pop-perfil/pop-perfil';
import { UserProfile } from '../../../features/perfil/models/user-profile.models';

@Component({
  selector: 'app-accesos-rapidos-admi',
  standalone: true,
  imports: [CommonModule, RouterModule, PopPerfilComponent],
  templateUrl: './accesos-rapidos-admi.html',
  styleUrls: ['./accesos-rapidos-admi.scss']
})
export class AccesosRapidosAdmi {
  showProfilePopup = false;

  items = [
    { label: 'Perfil', action: 'profile' },
    { label: 'Inicio', route: '/inicio-admi' },
    { label: 'Registrar Nuevo Usuario', route: '/registrar' },
    { label: 'Ver Usuarios Registrados', route: '/ver-registrados' },
    { label: 'Gestionar Sistema', route: '/gestionar-sistema' },
    { label: 'Ver Planificacion Completa', route: '/planificacion' },
    { label: 'Enviar formulario a carreras', route: 'envio-correo/programas' },
    { label: 'Enviar formulario monitores', route: 'envio-correo/monitores' },
    { label: 'Ver y Editar Monitores', route: '/solicitud-monitores' },
    { label: 'Consultar Log de Auditoria', route: '/auditoria' },
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

  onProfileUpdated(updatedProfile: UserProfile) {
    console.log('Perfil actualizado:', updatedProfile);
    // Aquí puedes actualizar la información del usuario en tu aplicación
    // Por ejemplo, actualizar el estado global del usuario
  }

  closeSidebar() {
    this.sidebarToggleService.closeSidebar();
  }
}