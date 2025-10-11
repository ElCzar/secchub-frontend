import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarToggleService } from '../../services/sidebar-toggle.service';

@Component({
  selector: 'app-sidebar-toggle-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-toggle-button.html',
  styleUrls: ['./sidebar-toggle-button.scss']
})
export class SidebarToggleButtonComponent {
  constructor(public readonly sidebarToggleService: SidebarToggleService) {}

  openSidebar() {
    this.sidebarToggleService.openSidebar();
  }
}