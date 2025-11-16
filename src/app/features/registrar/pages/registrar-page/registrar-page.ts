import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrarTableComponent } from '../../components/registrar-table/registrar-table';
import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { HeaderComponent } from "../../../../layouts/header/header.component";

@Component({
  selector: 'app-registrar-page',
  standalone: true,
  imports: [
    CommonModule, 
    RegistrarTableComponent, 
    AccesosRapidosAdmi, 
    SidebarToggleButtonComponent, 
    HeaderComponent
  ],
  templateUrl: './registrar-page.html',
  styleUrl: './registrar-page.scss'
})
export class RegistrarPage {
  constructor() {}
}
