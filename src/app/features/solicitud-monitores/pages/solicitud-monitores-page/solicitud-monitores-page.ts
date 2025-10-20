import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudMonitoresService } from '../../services/solicitud-monitores.service';
import { MonitoresTable } from '../../components/monitores-table/monitores-table';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { PopGuardarCambios } from '../../../../shared/components/pop-guardar-cambios/pop-guardar-cambios';
import { PopEnviarCambios } from '../../../../shared/components/pop-enviar-cambios/pop-enviar-cambios';
import { StudentApplicationResponseDTO } from '../../../../shared/model/dto/integration/StudentApplicationResponseDTO.model';
import { StudentApplicationScheduleResponseDTO } from '../../../../shared/model/dto/integration/StudentApplicationScheduleResponseDTO.model';
import { StatusDTO } from '../../../../shared/model/dto/parametric';
import { ParametricService } from '../../../../shared/services/parametric.service';
import { UserInformationResponseDTO } from '../../../../shared/model/dto/user/UserInformationResponseDTO.model';
import { UserInformationService } from '../../../../shared/services/user-information.service';
import { Monitor } from '../../model/monitor.model';
import { firstValueFrom } from 'rxjs';
import { TeachingAssistantResponseDTO } from '../../../../shared/model/dto/planning/TeachingAssistantResponseDTO.model';
import { CourseResponseDTO } from '../../../../shared/model/dto/admin/CourseResponseDTO.model';
import { CourseInformationService } from '../../../../shared/services/course-information.service';
import { SectionInformationService } from '../../../../shared/services/section-information.service';
import { HorarioMonitor } from '../../model/horario-monitor.model';
import { TeachingAssistantScheduleResponseDTO } from '../../../../shared/model/dto/planning/TeachingAssistantScheduleResponseDTO.model';
import { SectionResponseDTO } from '../../../../shared/model/dto/admin/SectionResponseDTO.model';
import { AccesosRapidosAdmi } from "../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi";

@Component({
  selector: 'app-solicitud-monitores-page',
  imports: [CommonModule, FormsModule, MonitoresTable, AccesosRapidosSeccion, AccesosRapidosAdmi, HeaderComponent, SidebarToggleButtonComponent, PopGuardarCambios, PopEnviarCambios],
  templateUrl: './solicitud-monitores-page.html',
  styleUrl: './solicitud-monitores-page.scss'
})

export class SolicitudMonitoresPage implements OnInit {
  // Information obtained
  studentApplications: StudentApplicationResponseDTO[] = [];
  studentInformation: UserInformationResponseDTO[] = [];
  userInformation: UserInformationResponseDTO[] = [];
  teachingAssistants: TeachingAssistantResponseDTO[] = [];

  // Information transformed into Monitor model
  monitores: Monitor[] = [];
  filteredMonitores: Monitor[] = [];
  adminMonitores: Monitor[] = [];
  nonAdminMonitores: Monitor[] = [];

  // Parametric information
  statuses: StatusDTO[] = [];
  courses: CourseResponseDTO[] = [];
  sections: SectionResponseDTO[] = [];


  // UI Filters
  searchQuery = '';
  selectedMateria = '';
  selectedSeccion = '';
  materias: number[] = [];
  secciones: number[] = [];

  // Toggle tables
  showAdminTable = false;
  showAcademicTable = true;

  // Popup save changes
  showSaveModal = false;
  saveSuccess = true;

  // Popup send changes
  showSendModal = false;

  constructor(
    private readonly monitoresService: SolicitudMonitoresService, 
    private readonly parametricService: ParametricService,
    private readonly userInformationService: UserInformationService,
    private readonly courseInformationService: CourseInformationService,
    private readonly sectionInformationService: SectionInformationService
  ) {}

  /**
   * Converts from StudentApplicationResponseDTO, UserInformationResponseDTO, and TeachingAssistantResponseDTO to Monitor model
   */
  private convertToMonitor(
    studentApplicationDTO: StudentApplicationResponseDTO,
    userInformationDTO: UserInformationResponseDTO,
    teachingAssistantDTO: TeachingAssistantResponseDTO | null
  ): Monitor {
    let statusName: string;
    if (studentApplicationDTO.statusId === this.statuses.find(s => s.name === 'Confirmed')?.id) {
      statusName = "aceptado";
    } else if (studentApplicationDTO.statusId === this.statuses.find(s => s.name === 'Rejected')?.id) {
      statusName = "rechazado";
    } else {
      statusName = "pendiente";
    }
    return {
      // Basic info
      id: studentApplicationDTO.id,
      userId: userInformationDTO.id,
      courseId: studentApplicationDTO.courseId,
      sectionId: studentApplicationDTO.sectionId,
      statusId: studentApplicationDTO.statusId,
      // Personal info
      nombre: userInformationDTO.name,
      apellido: userInformationDTO.lastName,
      carrera: studentApplicationDTO.program,
      semestre: studentApplicationDTO.studentSemester,
      promedio: studentApplicationDTO.academicAverage,
      correo: userInformationDTO.email,
      // Academic course info
      profesor: studentApplicationDTO.courseTeacher,
      noClase: teachingAssistantDTO?.classId,
      asignatura: this.courses.find(c => c.id === studentApplicationDTO.courseId)?.name,
      nota: studentApplicationDTO.courseAverage,
      // Administrative info
      seccionAcademica: this.sections.find(s => s.id === studentApplicationDTO.sectionId)?.name,
      administrativo: !!studentApplicationDTO.sectionId,
      // Monitor assignment details
      horasSemanales: teachingAssistantDTO?.weeklyHours,
      semanas: teachingAssistantDTO?.weeks,
      totalHoras: teachingAssistantDTO?.totalHours,
      // Status and classifications
      estado: statusName.toLowerCase() as 'pendiente' | 'aceptado' | 'rechazado',
      antiguo: studentApplicationDTO.wasTeachingAssistant,
      // Schedule information
      horarios: teachingAssistantDTO 
        ? this.convertToHorarioMonitor(teachingAssistantDTO) 
        : this.convertStudentApplicationSchedulesToHorarioMonitor(studentApplicationDTO.schedules || []),
      showHorarios: false
    };
  }

  /**
   * Converts from TeachingAssistantResponseDTO to HorarioMonitor model
   */
  private convertToHorarioMonitor(teachingAssistantDTO: TeachingAssistantResponseDTO): HorarioMonitor[] {
    const schedule: TeachingAssistantScheduleResponseDTO[] = teachingAssistantDTO.schedules;
    return schedule.map(s => ({
      id: s.id || 0,
      dia: s.day || '',
      horaInicio: s.startTime || '',
      horaFinal: s.endTime || '',
      totalHoras: this.calculateTotalHours(s.startTime, s.endTime)
    }));
  }

  /**
   * Converts from StudentApplicationScheduleResponseDTO array to HorarioMonitor model
   */
  private convertStudentApplicationSchedulesToHorarioMonitor(schedules: StudentApplicationScheduleResponseDTO[]): HorarioMonitor[] {
    return schedules.map(s => ({
      id: s.id || 0,
      dia: s.day || '',
      horaInicio: s.startTime || '',
      horaFinal: s.endTime || '',
      totalHoras: this.calculateTotalHours(s.startTime, s.endTime)
    }));
  }

  /**
   * Calculates total hours between start and end time
   */
  private calculateTotalHours(startTime?: string, endTime?: string): number {
    if (!startTime || !endTime) {
      return 0;
    }
    
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      const totalMinutes = endTotalMinutes - startTotalMinutes;
      return totalMinutes / 60; // Convert to hours
    } catch {
      return 0;
    }
  }

  ngOnInit(): void {
    this.loadParameters();
    this.loadMonitores();
    this.applyFilters();
  }

  // Load data for Student Applications
  loadMonitores() {
    this.monitoresService.getStudentApplications().subscribe(response => {
      const dtoArray = response.body as StudentApplicationResponseDTO[];
      this.studentApplications = dtoArray || [];
      this.loadMonitoresInfo();
    });
  }

  // Load user information for all monitors
  loadMonitoresInfo() {
    const studentApplications = this.studentApplications;
    const userIds = Array.from(new Set(studentApplications.map(m => m.userId).filter((id): id is number => !!id)));
    const studentApplicationIds = studentApplications.map(sa => sa.id).filter((id): id is number => typeof id === 'number');

    console.log('Loading info for student applications:', studentApplicationIds);

    // Fetch user information for each unique userId
    const userInfoObservables = userIds.map(id => this.userInformationService.getUserInformationById(id));
    // Fetch existing teaching assistants for the student applications
    const teachingAssistantObservables = studentApplicationIds.map(saId => this.monitoresService.getTeachingAssistantByStudentApplicationId(saId));

    // After both user information and teaching assistants are loaded, convert to Monitor model
    Promise.all([
      Promise.all(userInfoObservables.map(obs => firstValueFrom(obs))),
      Promise.all(teachingAssistantObservables.map(obs => firstValueFrom(obs)))
    ]).then(([userInfos, teachingAssistantResponses]) => {
      this.userInformation = userInfos.filter((info): info is UserInformationResponseDTO => info !== null);
      
      // Extract teaching assistants from HTTP response bodies
      this.teachingAssistants = teachingAssistantResponses
        .map(response => {
          const responseBody = response?.body;
          // Check if the response body is an array or a single object
          if (Array.isArray(responseBody)) {
            // If it's an array, take the first element (or return null if empty)
            return responseBody.length > 0 ? responseBody[0] as TeachingAssistantResponseDTO : null;
          } else {
            // If it's a single object, use it directly
            return responseBody as TeachingAssistantResponseDTO;
          }
        })
        .filter((ta): ta is TeachingAssistantResponseDTO => ta !== null && ta !== undefined);

      for (const ta of this.teachingAssistants) {
        console.log(`Teaching Assistant loaded:`, ta);
        console.log(`TA Properties:`, Object.keys(ta));
        console.log(`ID=${ta.id}, StudentApplicationID=${ta.studentApplicationId}`);
      }

      this.monitores = this.studentApplications.map(sa => {
        const userInfo = this.userInformation.find(ui => ui.id === sa.userId);
        const teachingAssistant = this.teachingAssistants.find(ta => ta.studentApplicationId === sa.id);
        if (userInfo && this.isAdministrator() && sa.statusId === this.statuses.find(s => s.name === 'Confirmed')?.id) {
          return this.convertToMonitor(sa, userInfo, teachingAssistant || null);
        } else if (userInfo && !this.isAdministrator()) {
          return this.convertToMonitor(sa, userInfo, teachingAssistant || null);
        } else {
          console.warn(`No user information found for student application ID ${sa.id} with user ID ${sa.userId}`);
          return null;
        }
      }).filter((m): m is Monitor => m !== null);

      // Update filter options after monitors are created
      this.materias = Array.from(new Set(this.monitores.map(m => m.courseId).filter((materia): materia is number => !!materia)))
        .sort((a: number, b: number) => a - b);
      this.secciones = Array.from(new Set(this.monitores.map(m => m.sectionId).filter((seccion): seccion is number => !!seccion)))
        .sort((a: number, b: number) => a - b);

      this.applyFilters();
    }).catch(error => {
      console.error('Error processing monitors data:', error);
    });
  }

  // Load parametric data: statuses, courses, sections
  loadParameters() {
    this.parametricService.getAllStatuses().subscribe(data => {
      this.statuses = data;
    });
    this.courseInformationService.findAllCourses().subscribe(data => {
      this.courses = data;
    });
    this.sectionInformationService.findAllSections().subscribe(data => {
      this.sections = data;
    });
  }

  // Handler when a student application is updated in any of the tables
  onMonitoresUpdate(updatedMonitores: Monitor[]) {
    this.applyFilters();
  }

  guardarCambios() {
    // Process approve/reject actions for individual monitors
    const approvePromises: Promise<any>[] = [];
    const rejectPromises: Promise<any>[] = [];

    for (const monitor of this.monitores) {
      if (monitor.estado === 'aceptado' && monitor.id) {
        // Save approval of student application
        approvePromises.push(
          firstValueFrom(this.monitoresService.approveStudentApplication(monitor.id))
        );
        // Save TeachingAssistant creation/update will be handled below
        const existingTA = this.teachingAssistants.find(ta => ta.studentApplicationId === monitor.id);
        const teachingAssistantRequestDTO = {
          studentApplicationId: monitor.id,
          weeklyHours: monitor.horasSemanales || 0,
          weeks: monitor.semanas || 0,
          schedules: (monitor.horarios ?? []).filter(h => h.dia && h.horaInicio && h.horaFinal).map(h => ({
            day: h.dia,
            startTime: (h.horaInicio.split(':').length === 2) ? h.horaInicio + ":00" : h.horaInicio,
            endTime: (h.horaFinal.split(':').length === 2) ? h.horaFinal + ":00" : h.horaFinal
          }))
        };
        if (existingTA) {
          // Update existing teaching assistant
          approvePromises.push(
            firstValueFrom(this.monitoresService.updateTeachingAssistant(existingTA.id, teachingAssistantRequestDTO))
          );
        } else {
          // Create new teaching assistant
          approvePromises.push(
            firstValueFrom(this.monitoresService.createTeachingAssistant(teachingAssistantRequestDTO))
          );
        }
      } else if (monitor.estado === 'rechazado' && monitor.id) {
        rejectPromises.push(
          firstValueFrom(this.monitoresService.rejectStudentApplication(monitor.id))
        );
                const existingTA = this.teachingAssistants.find(ta => ta.studentApplicationId === monitor.id);
        if (existingTA) {
          // Delete existing teaching assistant if monitor is rejected
          rejectPromises.push(
            firstValueFrom(this.monitoresService.deleteTeachingAssistant(existingTA.id))
          );
        }
      }
    }

    // Execute all approve/reject operations
    Promise.all([...approvePromises, ...rejectPromises])
      .then(() => {
        this.saveSuccess = true;
        this.showSaveModal = true;
      })
      .catch((error: any) => {
        console.error('Error al guardar cambios:', error);
        this.saveSuccess = false;
        this.showSaveModal = true;
      });
}

  enviarAAdministrador() {
    // Search for the name of the corresponding status id
    const totalSeleccionados = this.monitores.filter(m => m.statusId === this.statuses.find(s => s.name === 'Confirmed')?.id || m.statusId === this.statuses.find(s => s.name === 'Rejected')?.id).length;
    if (totalSeleccionados === 0) {
      this.saveSuccess = false;
      this.showSaveModal = true;
      return;
    }
    
    this.showSendModal = true;
    // TODO: Implementar lógica de envío real de alerta
  }

  exportarNomina() {
    // TODO: lógica de exportación de nómina
  }

  // Método para obtener el conteo de cambios
  get cambiosCount() {
    return this.monitores.filter(m => m.statusId === this.statuses.find(s => s.name === 'Confirmed')?.id || m.statusId === this.statuses.find(s => s.name === 'Rejected')?.id).length;
  }

  // Handlers filtros
  isAdministrator() {
    return localStorage.getItem('userRole') === 'ROLE_ADMIN';
  }

  onSearchChange() {
    this.applyFilters();
  }

  onMateriaChange() {
    this.applyFilters();
  }

  onSeccionChange() {
    this.applyFilters();
  }

  private applyFilters() {
    const q = this.searchQuery.trim().toLowerCase();
    const mat = this.selectedMateria;
    const sec = this.selectedSeccion;

    const base = this.monitores.filter(m => {
      const matchesQuery = !q || 
        [
          m.id, this.monitores.find(info => info.id === m.userId)?.nombre, 
          this.monitores.find(info => info.id === m.userId)?.apellido, 
          this.monitores.find(info => info.id === m.userId)?.correo
        ]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q));
      
      const matchesMateria = !mat || m.courseId === Number(mat);
      const matchesSeccion = !sec || m.sectionId === Number(sec);
      return matchesQuery && matchesMateria && matchesSeccion;
    });

    // Dividir en administrativos y no administrativos
    this.adminMonitores = base.filter(m => m.administrativo === true);
    this.nonAdminMonitores = base.filter(m => !m.administrativo);
    this.filteredMonitores = base; // por compatibilidad si se usa en otra parte
  }

  // Acciones de aprobar/rechazar (para tabla administrativa inline)
  aceptar(m: Monitor) {
    m.estado = m.estado === 'aceptado' ? 'pendiente' : 'aceptado';
  }

  rechazar(m: Monitor) {
    m.estado = m.estado === 'rechazado' ? 'pendiente' : 'rechazado';
  }

  recalc(m: Monitor) {
    m.totalHoras = (m.horasSemanales || 0) * (m.semanas || 0);
  }

  // Métodos para el popup de guardar cambios
  onSaveModalClosed() {
    this.showSaveModal = false;
  }

  onRetrySave() {
    this.showSaveModal = false;
    this.guardarCambios();
  }

  // Métodos para el popup de enviar cambios
  onConfirmSend() {
    this.showSendModal = false;
    
    // Simular envío
    setTimeout(() => {
      this.saveSuccess = true;
      this.showSaveModal = true;
    }, 300);
  }

  onCancelSend() {
    this.showSendModal = false;
  }
}

