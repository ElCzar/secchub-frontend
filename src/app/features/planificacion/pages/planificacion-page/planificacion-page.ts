import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { catchError, of, switchMap } from 'rxjs';

import { AccesosRapidosAdmi } from '../../../../shared/components/accesos-rapidos-admi/accesos-rapidos-admi';
import { AccesosRapidosSeccion } from '../../../../shared/components/accesos-rapidos-seccion/accesos-rapidos-seccion';
import { SidebarToggleButtonComponent } from '../../../../shared/components/sidebar-toggle-button/sidebar-toggle-button';
import { PlanningRow, PlanningStatus } from '../../models/planificacion.models';
import { PlanningClassesTable } from "../../components/planning-classes-table/planning-classes-table";
import { SelectedTeachers } from '../../services/selected-teachers';
import { ScheduleConflict } from '../../../docentes/components/schedule-conflict/schedule-conflict';
import { PopDuplicacionSemetre } from '../../components/pop-duplicacion-semetre/pop-duplicacion-semetre';
import { PlanningService } from '../../services/planning.service';
import { TeacherAssignmentService } from '../../services/teacher-assignment.service';
import { SelectedTeachersService } from '../../../docentes/services/selected-teachers.service';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { SemesterResponseDTO } from '../../../../shared/model/dto/admin/SemesterResponseDTO.model';

@Component({
  selector: 'app-planificacion-clases-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AccesosRapidosAdmi, AccesosRapidosSeccion, SidebarToggleButtonComponent, PlanningClassesTable, ScheduleConflict, PopDuplicacionSemetre, HeaderComponent],
  templateUrl: './planificacion-page.html',
  styleUrls: ['./planificacion-page.scss'],
})
export class PlanificacionClasesPage implements OnInit, OnDestroy {
  // Simulación de rol; cámbialo cuando conectemos auth
  role: 'admin' | 'seccion' = 'admin'; // Vuelto a admin para mostrar todos los filtros

  // Propiedades para filtros
  searchText: string = '';
  materiaFilter: string = '';
  seccionFilter: string = '';
  
  // Propiedades para el modal de conflicto de horarios
  showScheduleConflict: boolean = false;
  conflictData = {
    teacherName: '',
    conflictSchedule: '',
    conflictSubject: '',
    newSchedule: '',
    newSubject: ''
  };
  
  // Propiedades para el modal de duplicación de semestres
  showDuplicacionPopup: boolean = false;
  
  // Datos filtrados y originales
  originalRows: PlanningRow[] = [];
  filteredRows: PlanningRow[] = [];
  
  // Estado de carga
  loading = false;
  error: string | null = null;
  private dataLoaded = false; // Bandera para indicar si los datos están cargados
  private pendingTeacherSelections: Map<string, any> = new Map(); // Selecciones pendientes
  
  // Información del semestre actual
  currentSemester: SemesterResponseDTO | null = null;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly selectedTeachersService: SelectedTeachers,
    private readonly planningService: PlanningService,
    private readonly teacherAssignmentService: TeacherAssignmentService,
    private readonly newSelectedTeachersService: SelectedTeachersService,
    private readonly semesterService: SemesterInformationService
  ) {
    // Verificar si venimos de la selección de docentes
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['returnFromTeacherSelection']) {
      const selectedTeacher = navigation.extras.state['selectedTeacher'];
      const classKey = navigation.extras.state['classKey'];
      
      console.log('🔙 Regresando de selección de docentes:', { selectedTeacher, classKey });
      
      if (selectedTeacher && classKey) {
        // Procesar la asignación del docente
        this.handleTeacherAssignment(classKey, selectedTeacher);
      }
    }
  }

  //quitar mockeo
  rows: PlanningRow[] = [];
      
  ngOnInit() {
    // Suscribirse a los cambios en los docentes seleccionados
    this.subscription.add(
      this.selectedTeachersService.selectedTeachers$.subscribe(selectedTeachersMap => {
        console.log('📨 Cambio en selected teachers:', selectedTeachersMap);
        
        if (this.dataLoaded) {
          // Si los datos ya están cargados, procesar inmediatamente
          this.updateRowsWithSelectedTeachers(selectedTeachersMap);
        } else {
          // Si los datos no están cargados, guardar para procesar después
          console.log('⏳ Datos aún no cargados, guardando selecciones pendientes');
          selectedTeachersMap.forEach((selection, classKey) => {
            this.pendingTeacherSelections.set(classKey, selection);
          });
        }
      })
    );
    
    // Cargar información del semestre actual
    this.loadCurrentSemester();
    
    // Cargar datos del backend
    this.loadClassesFromBackend();
    this.registerGlobalDebugHelpers();
    
    // Iniciar polling para actualización automática de estados
    this.startStatusPolling();
  }

  // Helper global para depuración: recargar docentes de una clase desde la consola
  // Uso en consola del navegador: window.debugReloadTeachersForClass(36)
  private registerGlobalDebugHelpers() {
    (window as any).debugReloadTeachersForClass = (classId: number) => {
      console.log('🔧 debugReloadTeachersForClass llamado para classId:', classId);
      this.reloadTeacherAssignmentForClass(classId);
    };
    console.log('🔧 Helper global debugReloadTeachersForClass registrado');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Getters para opciones de filtros
  get availableMaterias(): string[] {
    const materias = this.originalRows
      .map(row => row.courseName)
      .filter((materia): materia is string => !!materia)
      .filter((materia, index, arr) => arr.indexOf(materia) === index)
      .sort();
    return materias;
  }

  get availableSecciones(): string[] {
    if (this.role !== 'admin') return [];
    
    const secciones = this.originalRows
      .map(row => row.section)
      .filter((seccion): seccion is string => !!seccion)
      .filter((seccion, index, arr) => arr.indexOf(seccion) === index)
      .sort();
    return secciones;
  }

  // ==========================================
  // CARGA DE DATOS DEL BACKEND
  // ==========================================

  /**
   * Carga la información del semestre actual
   */
  private loadCurrentSemester() {
    this.subscription.add(
      this.semesterService.getCurrentSemester()
        .pipe(
          catchError((error: any) => {
            console.error('Error al cargar semestre actual:', error);
            return of(null);
          })
        )
        .subscribe((semester: SemesterResponseDTO | null) => {
          this.currentSemester = semester;
          console.log('📅 Semestre actual cargado:', semester);
        })
    );
  }

  private loadClassesFromBackend() {
    this.loading = true;
    this.error = null;

    console.log('=== CARGANDO CLASES DESDE BACKEND ===');

    // Cargar todas las clases del backend con sus horarios
    this.subscription.add(
      this.planningService.getAllClassesWithSchedules()
        .pipe(
          catchError((error: any) => {
            console.error('Error al cargar clases del backend:', error);
            this.error = 'Error al cargar las clases. Verifique la conexión con el servidor.';
            // En caso de error, inicializar con datos vacíos para permitir creación
            this.initializeEmptyData();
            return of([]);
          })
        )
        .subscribe((classes: any[]) => {
          console.log('=== CLASES CARGADAS DEL BACKEND ===');
          console.log('Número de clases:', classes.length);
          console.log('Clases cargadas del backend:', classes);
          console.log('Detalle de cada clase cargada:');
          classes.forEach((classDTO: any, index: number) => {
            console.log(`Clase ${index}:`, {
              id: classDTO.id,
              courseId: classDTO.courseId,
              courseName: classDTO.courseName,
              startDate: classDTO.startDate,
              endDate: classDTO.endDate,
              capacity: classDTO.capacity,
              completeObject: classDTO
            });
          });
          
          if (classes.length > 0) {
            console.log('=== CONVIRTIENDO CLASES A PLANNING ROWS ===');
            // Convertir los DTOs del backend a PlanningRows
            this.originalRows = classes.map((classDTO: any, index: number) => {
              console.log(`Convirtiendo clase ${index}:`, classDTO);
              const planningRow = this.planningService.convertClassDTOToPlanningRow(classDTO);
              console.log(`PlanningRow resultante ${index}:`, planningRow);
              console.log(`Fechas - Original: ${classDTO.startDate}/${classDTO.endDate} -> Convertido: ${planningRow.startDate}/${planningRow.endDate}`);
              return planningRow;
            });

            console.log('=== TODAS LAS PLANNING ROWS ===');
            console.log('PlanningRows después de conversión:', this.originalRows);
            console.log('Resumen de fechas en originalRows:');
            this.originalRows.forEach((row, index) => {
              console.log(`Row ${index}: startDate="${row.startDate}", endDate="${row.endDate}"`);
            });

            // Aplicar filtros para poblar this.rows
            this.applyFilters();

            // Cargar asignaciones de docentes para cada clase
            this.loadTeacherAssignments();
          } else {
            // Si no hay clases, inicializar datos vacíos
            this.initializeEmptyData();
          }

          this.loading = false;
          this.dataLoaded = true; // Marcar que los datos están cargados
          
          // Procesar selecciones de docentes pendientes
          if (this.pendingTeacherSelections.size > 0) {
            console.log('📋 Procesando selecciones de docentes pendientes:', this.pendingTeacherSelections);
            this.updateRowsWithSelectedTeachers(this.pendingTeacherSelections);
            this.pendingTeacherSelections.clear();
          }
        })
    );
  }

  private loadTeacherAssignments() {
    // Cargar docentes asignados para cada clase que tenga backendId
    this.originalRows.forEach((row, index) => {
      if (row.backendId) {
        this.subscription.add(
          this.teacherAssignmentService.getTeachersAssignedToClass(row.backendId)
            .pipe(
              catchError((error: any) => {
                console.error(`Error al cargar docentes para clase ${row.backendId}:`, error);
                return of([]);
              })
            )
            .subscribe((teachers: any[]) => {
              if (teachers.length > 0) {
                  // Map backend teachers into the new teachers[] array and keep legacy teacher as first
                  this.originalRows[index].teachers = teachers.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    lastName: t.lastName,
                    email: t.email,
                    maxHours: t.maxHours,
                    assignedHours: (t as any).totalHours ?? t.assignedHours,
                    availableHours: (t as any).availableHours ?? (t.maxHours - ((t as any).totalHours ?? t.assignedHours))
                  }));
                  // Backwards compatibility: set legacy `teacher` to first
                  const primary = this.originalRows[index].teachers[0];
                  this.originalRows[index].teacher = primary ? { ...primary } : undefined;
                }
            })
        );
      }
    });

    // Después de cargar todo, aplicar filtros
    setTimeout(() => {
      this.applyFilters();
    }, 500); // Pequeño delay para que se carguen las asignaciones
  }

  private initializeEmptyData() {
    this.originalRows = [];
    this.filteredRows = [];
    this.rows = [];
    
    // Aplicar filtro por rol y agregar fila editable
    this.applyFilters();
  }

  // ==========================================
  // ACTUALIZACIÓN AUTOMÁTICA DE ESTADOS
  // ==========================================

  /**
   * Inicia el polling para verificar cambios en los estados de teacher_class
   * Se ejecuta cada 3 segundos para mantener los estados actualizados en tiempo real
   */
  private startStatusPolling() {
    console.log('🔄 Iniciando polling de estados de teacher_class (cada 3 segundos)');
    
    // Hacer una actualización inmediata al iniciar
    this.forceStatusUpdate();
    
    // Polling cada 3 segundos para respuesta más rápida
    this.subscription.add(
      interval(3000).pipe(
        switchMap(() => {
          // Obtener los IDs de las clases visibles que tienen backendId
          const classIds = this.rows
            .filter(row => row.backendId)
            .map(row => row.backendId!);
          
          if (classIds.length === 0) {
            return of([]);
          }
          
          // Obtener los estados actuales desde el backend
          return this.planningService.getTeacherClassStatuses(classIds).pipe(
            catchError(error => {
              console.warn('Error en polling de estados:', error);
              return of([]);
            })
          );
        })
      ).subscribe(statuses => {
        if (statuses.length > 0) {
          this.updateRowStatuses(statuses);
        }
      })
    );
  }

  /**
   * Fuerza una actualización inmediata de los estados de los profesores
   * Útil para actualizar después de asignar un profesor
   */
  forceStatusUpdate() {
    const classIds = this.rows
      .filter(row => row.backendId)
      .map(row => row.backendId!);
    
    if (classIds.length === 0) {
      return;
    }

    console.log('⚡ Forzando actualización inmediata de estados...');
    
    this.planningService.getTeacherClassStatuses(classIds).pipe(
      catchError(error => {
        console.warn('Error forzando actualización de estados:', error);
        return of([]);
      })
    ).subscribe(statuses => {
      if (statuses.length > 0) {
        this.updateRowStatuses(statuses);
        console.log('✅ Actualización forzada completada');
      }
    });
  }

  /**
   * Actualiza los estados de las filas basándose en los datos del backend
   * Solo actualiza si hay una asignación real de teacher_class
   * ACTUALIZADO: Ahora actualiza el estado individual de cada profesor
   */
  private updateRowStatuses(statuses: { 
    classId: number; 
    teacherStatuses: { teacherId: number; status: PlanningStatus }[]; 
    hasAssignment: boolean 
  }[]) {
    let hasChanges = false;
    
    statuses.forEach(({ classId, teacherStatuses, hasAssignment }) => {
      // Solo actualizar si realmente hay una asignación de teacher_class
      if (!hasAssignment || !teacherStatuses || teacherStatuses.length === 0) {
        return;
      }
      
      // Actualizar en rows (vista actual)
      const rowIndex = this.rows.findIndex(row => row.backendId === classId);
      if (rowIndex !== -1 && this.rows[rowIndex].teachers) {
        this.rows[rowIndex].teachers?.forEach(teacher => {
          const teacherStatus = teacherStatuses.find(ts => ts.teacherId === teacher.id);
          if (teacherStatus && teacher.status !== teacherStatus.status) {
            console.log(`🔄 Actualizando estado del profesor ${teacher.name} (ID: ${teacher.id}) en clase ${classId}: ${teacher.status} -> ${teacherStatus.status}`);
            teacher.status = teacherStatus.status;
            hasChanges = true;
          }
        });
      }
      
      // Actualizar en originalRows (datos originales)
      const originalIndex = this.originalRows.findIndex(row => row.backendId === classId);
      if (originalIndex !== -1 && this.originalRows[originalIndex].teachers) {
        this.originalRows[originalIndex].teachers?.forEach(teacher => {
          const teacherStatus = teacherStatuses.find(ts => ts.teacherId === teacher.id);
          if (teacherStatus && teacher.status !== teacherStatus.status) {
            teacher.status = teacherStatus.status;
          }
        });
      }
    });
    
    if (hasChanges) {
      console.log('✅ Estados de profesores actualizados automáticamente');
    }
  }

  // ==========================================
  // MÉTODOS PARA GUARDAR EN BACKEND
  // ==========================================

  async saveRow(row: PlanningRow, index: number) {
    if (row._state === 'new') {
      // Crear nueva clase en el backend
      await this.createNewClass(row, index);
    } else if (row._state === 'existing') {
      // Actualizar clase existente
      await this.updateExistingClass(row, index);
    }
  }

  private async createNewClass(row: PlanningRow, index: number) {
    if (!this.validateRowData(row)) {
      return;
    }

    try {
      console.log('=== CREANDO NUEVA CLASE ===');
      console.log('Row original antes de convertir:', row);
      
      const classDTO = this.planningService.convertPlanningRowToClassDTO(row);
      console.log('ClassDTO a enviar al backend:', classDTO);
      
      const createdClass = await this.planningService.createClass(classDTO).toPromise();
      console.log('=== RESPUESTA DEL BACKEND DESPUÉS DE CREAR ===');
      console.log('Clase creada por el backend:', createdClass);
      
      if (createdClass) {
        console.log('Clase creada exitosamente:', createdClass);
        
        // Enriquecer la clase creada con información del curso si viene vacía
        let enrichedClass = createdClass;
        if (!createdClass.courseName && createdClass.courseId) {
          console.log('🔄 Obteniendo nombre del curso para courseId:', createdClass.courseId);
          try {
            const course = await this.planningService.getCourseById(createdClass.courseId).toPromise();
            if (course) {
                  // Determine the best section name: prefer backend, then try to fetch by courseId, then fall back to the UI-provided section or a default
                  let resolvedSectionName = createdClass.sectionName;
                  if (!resolvedSectionName && createdClass.courseId) {
                    try {
                      resolvedSectionName = await this.planningService.getSectionByCourseId(String(createdClass.courseId)).toPromise();
                      console.log(`✅ Sección obtenida por courseId ${createdClass.courseId}:`, resolvedSectionName);
                    } catch (secErr) {
                      console.warn('⚠️ No se pudo obtener la sección por courseId, usando fallback:', secErr);
                      resolvedSectionName = row.section || 'Sin sección';
                    }
                  }

                  enrichedClass = {
                    ...createdClass,
                    courseName: course.name || `Curso ${createdClass.courseId}`,
                    sectionName: resolvedSectionName || row.section || 'Sin sección'
                  };
                  console.log('✅ Curso obtenido:', course);
                  console.log('✅ Clase enriquecida:', enrichedClass);
                }
          } catch (courseError) {
            console.warn('⚠️ Error obteniendo curso:', courseError);
            // Si falla, usar el nombre que teníamos en la interfaz
            enrichedClass = {
              ...createdClass,
              courseName: row.courseName || `Curso ${createdClass.courseId}`,
              sectionName: createdClass.sectionName || row.section || 'Sin sección'
            };
          }
        }
        
        // Asegurarnos de que enrichedClass tenga sección: si falta, intentar obtenerla por courseId
        if (!enrichedClass.sectionName && enrichedClass.courseId) {
          try {
            const fetchedSection = await this.planningService.getSectionByCourseId(String(enrichedClass.courseId)).toPromise();
            enrichedClass = { ...enrichedClass, sectionName: fetchedSection || row.section || 'Sin sección' };
            console.log('🔎 Sección obtenida y aplicada a enrichedClass:', enrichedClass.sectionName);
          } catch (fetchSecErr) {
            console.warn('⚠️ No se pudo obtener la sección adicionalmente, usando fallback:', fetchSecErr);
            enrichedClass = { ...enrichedClass, sectionName: enrichedClass.sectionName || row.section || 'Sin sección' };
          }
        }

        // Convertir la respuesta enriquecida del backend a PlanningRow para mantener consistencia
        const updatedRow = this.planningService.convertClassDTOToPlanningRow(enrichedClass);
        console.log('Row convertido desde respuesta del backend:', updatedRow);
        
        // Actualizar la fila con los datos del backend pero preservar las fechas originales si es necesario
        this.rows[index] = {
          ...updatedRow,
          _editing: false,
          _state: 'existing',
          // Preservar fechas de la interfaz si las del backend están vacías
          startDate: updatedRow.startDate || row.startDate,
          endDate: updatedRow.endDate || row.endDate,
          // Preservar nombre del curso si se enriqueció
          courseName: enrichedClass.courseName || row.courseName
        };
        
        console.log('=== FILA FINAL DESPUÉS DE ACTUALIZACIÓN ===');
        console.log('Fila actualizada:', this.rows[index]);
        console.log('Fechas finales:', {
          startDate: this.rows[index].startDate,
          endDate: this.rows[index].endDate,
          fromBackend: { start: updatedRow.startDate, end: updatedRow.endDate },
          fromOriginal: { start: row.startDate, end: row.endDate }
        });
        
        // También actualizar originalRows para mantener consistencia
        this.originalRows.push(this.rows[index]);
        
        // If there are teachers assigned locally (multiple), create assignments for each
        const teachersToAssign = row.teachers && row.teachers.length ? row.teachers : (row.teacher ? [row.teacher] : []);
        if (teachersToAssign.length > 0) {
          const computedHours = this.computeWorkHoursFromSchedules(this.rows[index]);
          for (const t of teachersToAssign) {
            if (t && t.id) {
              await this.assignTeacherToClass(enrichedClass.id!, Number(t.id), computedHours);
            }
          }
          // mark assigned time to avoid duplicates
          this.rows[index]._teacherAssignedAt = Date.now();
          try {
            const classKeyFromSnapshot = `${this.rows[index].courseName || 'nueva-clase'}-${this.rows[index].section || 'sin-seccion'}-${index}`;
            this.selectedTeachersService.clearSelectedTeachers(classKeyFromSnapshot);
          } catch (err) {
            // ignore
          }
        }
      }
    } catch (error) {
      console.error('Error al crear clase:', error);
      this.error = 'Error al crear la clase. Verifique los datos e intente nuevamente.';
    }
  }

  private async updateExistingClass(row: PlanningRow, index: number) {
    if (!row.backendId || !this.validateRowData(row)) {
      return;
    }

    try {
      const classDTO = this.planningService.convertPlanningRowToClassDTO(row);
      
      const updatedClass = await this.planningService.updateClass(row.backendId, classDTO).toPromise();
      if (updatedClass) {
        // Actualizar la fila con los datos actualizados
        this.rows[index] = this.planningService.convertClassDTOToPlanningRow(updatedClass);
        this.rows[index]._editing = false;
        
        console.log('Clase actualizada exitosamente:', updatedClass);
      }
    } catch (error) {
      console.error('Error al actualizar clase:', error);
      this.error = 'Error al actualizar la clase. Verifique los datos e intente nuevamente.';
    }
  }

  private async assignTeacherToClass(classId: number, teacherId: number, workHours: number) {
    try {
      await this.teacherAssignmentService.assignTeacherToClass(
        teacherId, 
        classId, 
        workHours, 
        'Asignación automática desde planificación'
      ).toPromise();
      
      console.log(`Docente ${teacherId} asignado a clase ${classId}`);
    } catch (error) {
      console.error('Error al asignar docente:', error);
    }
  }

  /**
   * Calcula las horas de trabajo sumando la duración de cada schedule de la fila.
   * Devuelve número entero de horas (si quieres decimales, lo cambiamos a float).
   */
  private computeWorkHoursFromSchedules(row?: PlanningRow): number {
    try {
      if (!row || !row.schedules || row.schedules.length === 0) return 4; // fallback

      let totalMinutes = 0;
      for (const s of row.schedules) {
        if (!s.startTime || !s.endTime) continue;
        // Expect formats like "08:00"
        const [sh, sm] = (s.startTime || '').split(':').map(Number);
        const [eh, em] = (s.endTime   || '').split(':').map(Number);
        if (Number.isFinite(sh) && Number.isFinite(eh)) {
          const start = (sh * 60) + (Number.isFinite(sm) ? sm : 0);
          const end = (eh * 60) + (Number.isFinite(em) ? em : 0);
          const diff = Math.max(0, end - start);
          totalMinutes += diff;
        }
      }

      const hours = Math.ceil(totalMinutes / 60);
      return hours > 0 ? hours : 4;
    } catch (err) {
      console.warn('Error calculando horas desde schedules, usando fallback 4h', err);
      return 4;
    }
  }

  private validateRowData(row: PlanningRow): boolean {
    console.log('=== VALIDANDO DATOS DE LA FILA ===');
    console.log('Row completa:', row);
    console.log('Validaciones individuales:');
    
    if (!row.courseName?.trim()) {
      console.error('❌ Validación falló: courseName vacío:', row.courseName);
      this.error = 'El nombre del curso es requerido';
      return false;
    }
    console.log('✅ courseName válido:', row.courseName);
    
    if (!row.courseId?.trim()) {
      console.error('❌ Validación falló: courseId vacío:', row.courseId);
      this.error = 'El ID del curso es requerido';
      return false;
    }
    console.log('✅ courseId válido:', row.courseId);
    
    if (!row.section?.trim()) {
      console.error('❌ Validación falló: section vacía:', row.section);
      this.error = 'La sección es requerida';
      return false;
    }
    console.log('✅ section válida:', row.section);
    
    // Para clases nuevas, el classId puede estar vacío (se genera automáticamente)
    if (row._state === 'existing' && !row.classId?.trim()) {
      console.error('❌ Validación falló: classId vacío en clase existente:', row.classId);
      this.error = 'El ID de la clase es requerido para clases existentes';
      return false;
    }
    console.log('✅ classId válido (o es clase nueva):', row.classId);
    
    // Las fechas son opcionales - se pueden agregar después mediante edición
    if (row.startDate) {
      console.log('✅ startDate válida:', row.startDate);
    } else {
      console.log('ℹ️ startDate vacía (opcional):', row.startDate);
    }
    
    if (row.endDate) {
      console.log('✅ endDate válida:', row.endDate);
    } else {
      console.log('ℹ️ endDate vacía (opcional):', row.endDate);
    }
    
    if (row.seats <= 0) {
      console.error('❌ Validación falló: seats inválidos:', row.seats);
      this.error = 'La capacidad debe ser mayor a 0';
      return false;
    }
    console.log('✅ seats válidos:', row.seats);
    
    // Validación adicional: si hay fechas, verificar que sean lógicas
    if (row.startDate && row.endDate) {
      const startDate = new Date(row.startDate);
      const endDate = new Date(row.endDate);
      if (startDate >= endDate) {
        console.error('❌ Validación falló: fecha de inicio debe ser anterior a fecha de fin');
        this.error = 'La fecha de inicio debe ser anterior a la fecha de fin';
        return false;
      }
      console.log('✅ Rango de fechas válido');
    }

    console.log('✅ TODAS LAS VALIDACIONES PASARON');
    return true;
  }

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================

  // Método para aplicar filtros
  applyFilters() {
    let filtered = [...this.originalRows];

    // Filtro por rol (sección)
    if (this.role === 'seccion') {
      const userSection = 'SIS'; // En producción vendría del usuario autenticado
      filtered = filtered.filter(row => 
        row.section?.startsWith(userSection) ?? false
      );
    }

    // Filtro por búsqueda de texto
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(row => 
  row.courseName?.toLowerCase().includes(searchLower) ||
  row.courseId?.toLowerCase().includes(searchLower) ||
  ((row.teachers && row.teachers.some(t => (t.name || '').toLowerCase().includes(searchLower))) || row.teacher?.name?.toLowerCase().includes(searchLower)) ||
  row.section?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por materia
    if (this.materiaFilter) {
      filtered = filtered.filter(row => row.courseName === this.materiaFilter);
    }

    // Filtro por sección (solo para admin)
    if (this.seccionFilter && this.role === 'admin') {
      filtered = filtered.filter(row => row.section === this.seccionFilter);
    }

    this.rows = filtered;
    
    // Asegurar que siempre haya una fila editable
    this.ensureEditableRow();
  }

  private async updateRowsWithSelectedTeachers(selectedTeachersMap: Map<string, any> | any) {
    console.log('🔄 Actualizando filas con docentes seleccionados:', selectedTeachersMap);
    
    // Convertir a Map si no lo es ya
    let mapToProcess: Map<string, any>;
    if (selectedTeachersMap instanceof Map) {
      mapToProcess = selectedTeachersMap;
    } else {
      // Si es un objeto RxJS Map, convertir a Map nativo
      mapToProcess = new Map();
      if (selectedTeachersMap && typeof selectedTeachersMap.forEach === 'function') {
        selectedTeachersMap.forEach((value: any, key: string) => {
          mapToProcess.set(key, value);
        });
      }
    }
    
    // Verificar que tenemos datos cargados
    if (!this.dataLoaded || this.originalRows.length === 0) {
      console.log('⚠️ Datos aún no están listos para procesar selecciones');
      return;
    }
    
    // Iterar sobre cada selección de docentes
    for (const [classKey, selection] of mapToProcess) {
      console.log('📋 Procesando selección:', classKey, selection);

      if (selection.teachers && selection.teachers.length > 0) {
        const selectedTeacher = selection.teachers[0];
        console.log('👨‍🏫 Docente seleccionado:', selectedTeacher);

        // Buscar la clase en originalRows usando diferentes estrategias
        let classRow = this.findRowByClassKey(classKey);

        if (!classRow) {
          console.warn('⚠️ No se encontró la clase con classKey en originalRows:', classKey);
          // Intentar encontrar en this.rows usando rowIndex si está disponible en la selección
          if (selection.rowIndex !== undefined && this.rows && this.rows[selection.rowIndex]) {
            console.log(`🔁 Encontrada fila en this.rows por rowIndex ${selection.rowIndex}`);
            classRow = this.rows[selection.rowIndex];
          } else {
            // Intentar emparejar por nombre y sección en this.rows
            const keyParts = classKey.split('-');
            if (keyParts.length >= 2) {
              const searchCourseName = keyParts[0];
              const searchSection = keyParts[1];
              const foundInView = this.rows.find(r => (r.courseName || 'nueva-clase') === searchCourseName && (r.section || 'Sin sección') === searchSection);
              if (foundInView) {
                console.log('🔁 Encontrada fila en this.rows por nombre+sección:', foundInView);
                classRow = foundInView;
              }
            }
          }

          if (!classRow) {
            console.error('❌ No se encontró la clase con classKey en ninguna estructura:', classKey);
            // Intentar restaurar la fila desde un snapshot si está disponible en la selección
            if (selection && selection.rowSnapshot) {
              console.log('🔁 Se detectó snapshot de fila en la selección; restaurando fila desde snapshot');
              try {
                const restored: PlanningRow = this.planningService.convertClassDTOToPlanningRow(selection.rowSnapshot);
                // Asegurar que tenga un estado correcto
                restored._state = restored.backendId ? 'existing' : 'new';
                restored._editing = !!restored._editing || false;

                // Insertar en originalRows y en la vista (this.rows)
                this.originalRows.push(restored);
                this.applyFilters();

                // Reintentar encontrar la fila después de restaurar
                classRow = this.findRowByClassKey(classKey);
                if (classRow) {
                  console.log('✅ Fila restaurada y encontrada con classKey:', classKey);
                }
              } catch (err) {
                console.warn('⚠️ Error restaurando snapshot de fila:', err);
              }
            }
            console.log('📋 Clases disponibles:');
            this.originalRows.forEach((row, idx) => {
              const rowKeyWithId = this.generateClassKey(row, true);
              const rowKeyWithIndex = this.generateClassKey(row, false, idx);
              console.log(`  ${idx}: "${rowKeyWithId}" o "${rowKeyWithIndex}"`);
            });

            // Intentar reintentar la asignación más tarde en caso de race condition (fila aún no cargada)
            const retryKey = `__retry__${classKey}`;
            const currentRetry = (selection.__retryCount || 0) as number;
            if (currentRetry < 5) {
              console.log(`⏳ Reintentando asignación para ${classKey} en 800ms (intento ${currentRetry + 1}/5)`);
              // Marcar y reencolar
              (selection as any).__retryCount = currentRetry + 1;
              // Re-agregar a pendingTeacherSelections temporalmente
              this.pendingTeacherSelections.set(retryKey, selection);
              setTimeout(() => {
                // Mover de pending a procesamiento directo
                const sel = this.pendingTeacherSelections.get(retryKey);
                if (sel) {
                  this.pendingTeacherSelections.delete(retryKey);
                  // Reprocesar solo esta selección
                  const tempMap = new Map<string, any>();
                  tempMap.set(classKey, sel);
                  this.updateRowsWithSelectedTeachers(tempMap);
                }
              }, 800);
            } else {
              console.warn(`⚠️ Se alcanzó el máximo de reintentos para ${classKey}, omitiendo.`);
            }

            // No retornamos inmediatamente para evitar borrar filas nuevas en edición; simplemente saltar por ahora
            return;
          }
        }

        if (!classRow.backendId) {
          console.warn('⚠️ La clase encontrada no tiene backendId, intentando crearla antes de asignar docente:', classRow);

          // Intentar ubicar índice en la vista para pasar a createNewClass
          let viewIndex = -1;
          // Preferir el rowIndex enviado en la selección si está disponible
          if (selection && selection.rowIndex !== undefined && this.rows[selection.rowIndex]) {
            viewIndex = selection.rowIndex;
          } else {
            viewIndex = this.rows.findIndex(r => r.courseName === classRow?.courseName && r.section === classRow?.section && r.classId === classRow?.classId);
          }

          if (viewIndex === -1) {
            console.log('ℹ️ Fila no encontrada en this.rows; agregando temporalmente para crearla');
            // Insertar la fila en la vista para que createNewClass pueda usar el índice
            this.rows.push(classRow);
            viewIndex = this.rows.length - 1;
          }

          try {
            // Marcar como nueva y desactivar edición para crear
            classRow._state = 'new';
            classRow._editing = false;

            // Validar y auto-corregir campos frecuentes que impiden la creación
            if (!this.validateRowData(classRow)) {
              console.log('⚠️ La fila no pasó validación completa; intentando auto-corregir campos comunes (seats)');
              if (!classRow.seats || classRow.seats <= 0) {
                classRow.seats = 1; // valor por defecto mínimo razonable
                console.log('🔧 seats auto-configurado a 1');
              }
              // Re-evaluar validación
              if (!this.validateRowData(classRow)) {
                console.error('❌ Aún no cumple validación después de auto-corregir; no se puede crear la clase automáticamente');
                return;
              }
            }

            console.log('🔄 Creando clase en backend antes de asignar docente (viewIndex):', viewIndex);
            await this.createNewClass(classRow, viewIndex);

            // Después de creación, intentar encontrar la fila con backendId
            classRow = this.findRowByClassKey(classKey) || this.rows[viewIndex];
            if (!classRow || !classRow.backendId) {
              console.error('❌ No se pudo crear la clase o sigue sin backendId después de crearla:', classRow);
              return;
            }
            console.log('✅ Clase creada con backendId ahora disponible:', classRow.backendId);
          } catch (createErr) {
            console.error('💥 Error creando la clase antes de asignar docente:', createErr);
            return;
          }
        }

        console.log('✅ Clase encontrada para asignación:', classRow);
        // Protección: si ya tiene el mismo docente asignado, saltar para evitar duplicados
        const alreadyAssigned = (classRow.teachers && classRow.teachers.some((tt:any) => tt.id === selectedTeacher.id)) || (classRow.teacher && classRow.teacher.id === selectedTeacher.id);
        if (alreadyAssigned) {
          console.log('ℹ️ Clase ya tiene asignado al mismo docente; omitiendo reasignación para evitar duplicado');
          this.selectedTeachersService.clearSelectedTeachers(classKey);
          return;
        }
        // Protección temporal: si acabamos de crear/asignar, evitar re-asignar (marca _teacherAssignedAt en ms)
        const recentlyAssigned = (classRow as any)._teacherAssignedAt ? (Date.now() - (classRow as any)._teacherAssignedAt) < 5000 : false;
        if (recentlyAssigned) {
          console.log('ℹ️ La clase fue asignada hace poco; omitiendo reasignación para evitar duplicado');
          this.selectedTeachersService.clearSelectedTeachers(classKey);
          return;
        }
        
        // Actualizar la clase localmente primero: append to teachers[] and keep legacy teacher in sync
        if (!classRow.teachers) classRow.teachers = [];
        classRow.teachers.push({
          id: selectedTeacher.id,
          name: selectedTeacher.name,
          lastName: selectedTeacher.lastName,
          email: selectedTeacher.email
        });
        // Keep legacy single teacher for backward compatibility
        classRow.teacher = classRow.teachers[0];
        
        // Actualizar también en las filas filtradas si existen
        if (this.rows) {
          const rowIndex = this.rows.findIndex(row => row.backendId === classRow.backendId);
            if (rowIndex !== -1) {
            this.rows[rowIndex].teachers = classRow.teachers ? [...classRow.teachers] : [];
            this.rows[rowIndex].teacher = this.rows[rowIndex].teachers[0];
            console.log('📊 Fila actualizada en vista:', rowIndex, this.rows[rowIndex]);
          }
        }
        
        // Generar la clave actual de la clase (con backendId) para persistencia
        const currentClassKey = this.generateClassKey(classRow, true);
        
        // Persistir en backend usando el método existente
        this.handleTeacherAssignment(currentClassKey, selectedTeacher);
        
        // Limpiar la selección usando la clave original (la que se usó para seleccionar)
        this.selectedTeachersService.clearSelectedTeachers(classKey);
      } else {
        console.log('⚠️ Selección no válida para classKey:', classKey);
      }
    }
  }

  private ensureEditableRow() {
    // Solo agregar una fila nueva si NO hay filas en absoluto
    if (this.rows.length === 0) {
      this.addNewEditableRow();
    }
    // No agregamos fila automáticamente si ya hay filas existentes
  }

  private addNewEditableRow() {
    const newRow: PlanningRow = {
      _state: 'new',
      courseId: '',
      courseName: '',
      section: '',
      classId: '',
      seats: 0,
      startDate: '',
      endDate: '',
      weeks: 0,
      teachers: [],
      teacher: undefined,
      status: 'PENDIENTE',
      notes: [],
      schedules: [],
      _editing: true // Nueva fila siempre en modo edición
    };
    this.rows.push(newRow);
  }

  // Botones superiores
  planAnterior() {
    this.showDuplicacionPopup = true;
  }
  
  aplicarPlaneacion() {}

  /**
   * Cierra el popup de duplicación de semestre
   */
  onCloseDuplicacion(): void {
    this.showDuplicacionPopup = false;
  }


  /**
   * Aplica la duplicación del semestre seleccionado
   */
  onApplySemester(selectedSemester: string): void {
    console.log('Aplicando planificación del semestre:', selectedSemester);
    
    // Mostrar mensaje de éxito y recargar los datos
    alert(`Planificación del semestre ${selectedSemester} aplicada exitosamente`);
    
    // Recargar los datos desde el backend para reflejar los cambios
    this.loadClassesFromBackend();
    
    // Cerrar el popup
    this.showDuplicacionPopup = false;
  }

  /**
   * Genera una clave única para identificar una clase
   */
  private generateClassKey(row: PlanningRow, useBackendId: boolean = true, rowIndex?: number): string {
    const courseName = row.courseName || 'nueva-clase';
    const section = row.section || 'Sin sección';
    
    if (useBackendId && row.backendId) {
      return `${courseName}-${section}-${row.backendId}`;
    } else if (rowIndex !== undefined) {
      return `${courseName}-${section}-${rowIndex}`;
    } else {
      return `${courseName}-${section}-sin-id`;
    }
  }

  /**
   * Busca una fila usando diferentes estrategias para el classKey
   */
  private findRowByClassKey(classKey: string): PlanningRow | undefined {
    console.log('🔍 Buscando fila con classKey:', classKey);
    
    // Estrategia 1: Buscar con backendId
    let foundRow = this.originalRows.find(row => {
      const rowKey = this.generateClassKey(row, true);
      const matches = rowKey === classKey;
      if (matches) console.log('✅ Encontrado con backendId:', rowKey);
      return matches;
    });
    
    if (foundRow) return foundRow;
    
    // Estrategia 2: Buscar con índice (para selecciones hechas antes de cargar backendIds)
    foundRow = this.originalRows.find((row, index) => {
      const rowKey = this.generateClassKey(row, false, index);
      const matches = rowKey === classKey;
      if (matches) console.log('✅ Encontrado con índice:', rowKey);
      return matches;
    });
    
    if (foundRow) return foundRow;
    
    // Estrategia 3: Buscar parcialmente por nombre y sección (fallback)
    const keyParts = classKey.split('-');
    if (keyParts.length >= 2) {
      const searchCourseName = keyParts[0];
      const searchSection = keyParts[1];
      
      foundRow = this.originalRows.find(row => {
        const courseNameMatches = (row.courseName || 'nueva-clase') === searchCourseName;
        const sectionMatches = (row.section || 'Sin sección') === searchSection;
        const matches = courseNameMatches && sectionMatches;
        if (matches) console.log('✅ Encontrado por nombre y sección:', row.courseName, row.section);
        return matches;
      });
    }
    
    return foundRow;
  }

  onPatchRow(e: { index: number; data: Partial<PlanningRow> }) {
    console.log(`🔄 onPatchRow - Fila ${e.index}:`, e.data);
    console.log(`📊 Estado actual de la fila:`, {
      editing: this.rows[e.index]._editing,
      state: this.rows[e.index]._state,
      backendId: this.rows[e.index].backendId
    });
    
    // Actualizar los datos localmente
    Object.assign(this.rows[e.index], e.data);
    
    // Si no está en modo edición y es una fila existente, guardar automáticamente
    if (!this.rows[e.index]._editing && this.rows[e.index]._state === 'existing') {
      console.log(`💾 Guardando automáticamente cambios en fila ${e.index}`);
      this.saveRowToBackend(this.rows[e.index], e.index);
    } else {
      console.log(`⏸️ No se guarda automáticamente - Motivo:`, {
        enEdicion: this.rows[e.index]._editing,
        estado: this.rows[e.index]._state,
        requiere: { editing: false, state: 'existing' }
      });
    }
  }

  /**
   * Guardar una fila específica en el backend
   */
  private saveRowToBackend(row: PlanningRow, index: number) {
    if (!row.backendId) {
      console.warn('No se puede guardar una fila sin backendId');
      return;
    }

    console.log('Datos de la fila antes de guardar:', row);

    // Convertir PlanningRow a ClassDTO
    const classData = this.planningService.convertPlanningRowToClassDTO(row);
    
    console.log('Guardando cambios en clase:', classData);

    this.planningService.updateClass(row.backendId, classData).subscribe({
      next: (updatedClass) => {
        console.log('Clase actualizada exitosamente:', updatedClass);
        console.log('Datos actualizados del backend:', updatedClass);
        
        // Actualizar solo los campos necesarios, manteniendo la información de UI
        this.rows[index]._editing = false;
        this.rows[index]._state = 'existing';
        this.rows[index].backendId = updatedClass.id;
        
        // Actualizar courseId si viene del backend
        if (updatedClass.courseId) {
          this.rows[index].courseId = updatedClass.courseId.toString();
        }
        
        // Actualizar fechas solo si vienen del backend
        if (updatedClass.startDate) {
          this.rows[index].startDate = updatedClass.startDate;
        }
        if (updatedClass.endDate) {
          this.rows[index].endDate = updatedClass.endDate;
        }
        
        // Actualizar otros campos importantes
        if (updatedClass.capacity !== undefined) {
          this.rows[index].seats = updatedClass.capacity;
        }
        if (updatedClass.weeks !== undefined) {
          this.rows[index].weeks = updatedClass.weeks;
        }
        
        console.log('Fila actualizada en la interfaz:', this.rows[index]);
      },
      error: (error) => {
        console.error('Error al actualizar clase:', error);
        // Mostrar mensaje de error al usuario
        alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
      }
    });
  }
  
  onAddRow() {
    // Agregar una nueva fila en modo edición
    this.addNewEditableRow();
  }

  /**
   * Manejar el guardado de una fila (nueva o editada)
   */
  async onSaveRow(e: { index: number; data: PlanningRow }) {
    const row = e.data;
    
    console.log('=== onSaveRow EJECUTADO ===');
    console.log('Índice:', e.index);
    console.log('Datos de la fila:', row);
    console.log('Estado de la fila:', row._state);
    console.log('¿Es nueva?', row._state === 'new');
    console.log('¿Es existente?', row._state === 'existing');
    
    if (row._state === 'new') {
      console.log('🔄 Creando nueva clase...');
      // Crear nueva clase en el backend
      await this.createNewClass(row, e.index);
    } else if (row._state === 'existing') {
      console.log('🔄 Actualizando clase existente...');
      // Actualizar clase existente
      this.saveRowToBackend(row, e.index);
    } else {
      console.warn('⚠️ Estado de fila no reconocido:', row._state);
    }
  }

  
  async onRemoveRow(i: number) {
    const row = this.rows[i];
    
    // Si la fila existe en el backend, eliminarla
    if (row.backendId && row._state === 'existing') {
      try {
        await this.planningService.deleteClass(row.backendId).toPromise();
        console.log(`Clase ${row.backendId} eliminada del backend`);
      } catch (error) {
        console.error('Error al eliminar clase del backend:', error);
        this.error = 'Error al eliminar la clase del servidor';
        return; // No continuar con la eliminación local si falló en el backend
      }
    }
    
    // Eliminar de la lista local
    this.rows = this.rows.filter((_, idx) => idx !== i);
    
    // Después de eliminar, asegurar que haya una fila editable
    this.ensureEditableRow();
  }

  // Guardar cambios en el backend
  async guardar() { 
    console.log('Guardando cambios en el backend...', this.rows);
    this.loading = true;
    this.error = null;

    try {
      // Guardar cada fila que esté en modo edición o sea nueva
      for (let i = 0; i < this.rows.length; i++) {
        const row = this.rows[i];
        if (row._editing || row._state === 'new') {
          await this.saveRow(row, i);
        }
      }

      // Recargar datos del backend para asegurar consistencia
      await this.reloadData();
      
      console.log('Todos los cambios guardados exitosamente');

      // Exportar a Excel después de guardar
      this.planningService.exportToExcel(this.rows);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      this.error = 'Error al guardar algunos cambios. Verifique los datos e intente nuevamente.';
    } finally {
      this.loading = false;
    }
  }

  private async reloadData() {
    // Recargar datos del backend sin mostrar loading adicional
    const classes = await this.planningService.getAllClassesWithSchedules().toPromise();
    if (classes) {
      this.originalRows = classes.map(classDTO => 
        this.planningService.convertClassDTOToPlanningRow(classDTO)
      );
      
      // Aplicar filtros para actualizar this.rows
      this.applyFilters();
      
      this.loadTeacherAssignments();
    }
  }

  // Métodos para el modal de conflicto de horarios
  showConflictModal(teacherName: string, conflictSchedule: string, conflictSubject: string, newSchedule: string, newSubject: string) {
    this.conflictData = {
      teacherName,
      conflictSchedule,
      conflictSubject,
      newSchedule,
      newSubject
    };
    this.showScheduleConflict = true;
  }

  onConflictModalClosed() {
    this.showScheduleConflict = false;
  }

  onAssignDifferentTeacher() {
    this.showScheduleConflict = false;
    // Aquí iría la lógica para abrir el modal de selección de profesores
    console.log('Abriendo modal para asignar otro profesor');
  }

  // Método de prueba para mostrar el modal
  testScheduleConflict() {
    this.showConflictModal(
      'Maria Sanchez',
      'Lunes 08:00 - 10:00',
      'Programación I',
      'Lunes 08:00 - 10:00',
      'Base de Datos'
    );
  }

  // ==========================================
  // MANEJO DE ASIGNACIÓN DE DOCENTES
  // ==========================================

  /**
   * Manejar la asignación de un docente a una clase cuando regresa de la selección
   */
  private handleTeacherAssignment(classKey: string, selectedTeacher: any) {
    console.log('🎯 Procesando asignación de docente:', { classKey, selectedTeacher });
    
    // Usar el nuevo método de búsqueda con múltiples estrategias
    const classRow = this.findRowByClassKey(classKey);

    if (!classRow) {
      console.error('❌ No se encontró la clase con classKey:', classKey);
      console.log('📋 Clases disponibles:');
      this.originalRows.forEach((row, idx) => {
        const rowKeyWithId = this.generateClassKey(row, true);
        const rowKeyWithIndex = this.generateClassKey(row, false, idx);
        console.log(`  ${idx}: "${rowKeyWithId}" o "${rowKeyWithIndex}"`);
      });
      return;
    }

    if (!classRow.backendId) {
      console.error('❌ La clase encontrada no tiene backendId:', classRow);
      return;
    }

  // Calcular horas de trabajo basadas en los schedules de la clase
  const workHours = this.computeWorkHoursFromSchedules(classRow);
  console.log(`📋 Asignando docente ${selectedTeacher.id} a clase ${classRow.backendId} con ${workHours} horas (calculadas desde schedules)`);
    
    // Hacer la asignación en el backend
    this.subscription.add(
      this.planningService.assignTeacherToClass(
        classRow.backendId,
        selectedTeacher.id,
        workHours,
        `Asignado desde planificación - ${new Date().toLocaleString()}`
      ).subscribe({
        next: (response) => {
          console.log('✅ Docente asignado exitosamente:', response);
          
          // Actualizar la fila local con la información del docente
          const assignedHours = (response as any).totalHours ?? response.assignedHours;
          const availableHours = (response as any).availableHours ?? (response.maxHours - assignedHours);
          classRow.teacher = {
            id: selectedTeacher.id,
            name: selectedTeacher.name,
            lastName: selectedTeacher.lastName,
            email: selectedTeacher.email,
            maxHours: response.maxHours,
            assignedHours: assignedHours,
            availableHours: availableHours
          };
          
          // Aplicar filtros para actualizar la vista inmediatamente
          this.applyFilters();
          
          // Recargar las asignaciones para esta clase para confirmar
          this.reloadTeacherAssignmentForClass(classRow.backendId!);
          
          // Forzar actualización inmediata de estados
          setTimeout(() => {
            console.log('⚡ Forzando actualización de estados después de asignar docente...');
            this.forceStatusUpdate();
          }, 500); // Pequeño delay para dar tiempo al backend
          
          // Mostrar mensaje de éxito (opcional)
          console.log(`🎉 ${selectedTeacher.name} asignado correctamente a ${classRow.courseName}`);
        },
        error: (error) => {
          console.error('❌ Error asignando docente:', error);
          console.error('Detalles del error:', error.error);
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      })
    );
  }

  /**
   * Recargar la asignación de docente para una clase específica
   */
  private reloadTeacherAssignmentForClass(classId: number) {
    this.subscription.add(
      this.planningService.getAssignedTeachers(classId).subscribe({
        next: (teachers) => {
          console.log(`🔄 Docentes recargados para clase ${classId}:`, teachers);
          
          // Encontrar la fila y actualizar con los docentes asignados
          const row = this.originalRows.find(r => r.backendId === classId);
          if (row && teachers.length > 0) {
            // Map to teachers[] and keep legacy teacher as first
            row.teachers = teachers.map((t: any) => ({
              id: t.id,
              name: t.name,
              lastName: t.lastName,
              email: t.email,
              maxHours: t.maxHours,
              assignedHours: (t as any).totalHours ?? t.assignedHours,
              availableHours: (t as any).availableHours ?? (t.maxHours - ((t as any).totalHours ?? t.assignedHours))
            }));
            row.teacher = row.teachers[0];

            // Actualizar también this.rows (vista filtrada) si existe la fila
            const viewIndex = this.rows.findIndex(r => r.backendId === classId);
            if (viewIndex !== -1) {
              console.log(`🔁 Actualizando fila en vista en índice ${viewIndex}`);
              this.rows[viewIndex].teachers = row.teachers ? [...row.teachers] : [];
              this.rows[viewIndex].teacher = this.rows[viewIndex].teachers[0];
            } else {
              console.log('ℹ️ Fila no encontrada en la vista filtrada, forzando applyFilters()');
              this.applyFilters();
            }
            
            // Forzar actualización de estados después de recargar
            setTimeout(() => {
              console.log('⚡ Actualizando estados después de recargar docentes...');
              this.forceStatusUpdate();
            }, 300);
          }
        },
        error: (error) => {
          console.error(`❌ Error recargando docentes para clase ${classId}:`, error);
        }
      })
    );
  }

  public isAdministrator(): boolean {
    return localStorage.getItem('userRole') === 'ROLE_ADMIN';
  }
}
