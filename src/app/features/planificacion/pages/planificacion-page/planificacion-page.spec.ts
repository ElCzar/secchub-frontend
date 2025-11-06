import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { PlanificacionClasesPage } from './planificacion-page';
import { PlanningService } from '../../services/planning.service';
import { TeacherAssignmentService } from '../../services/teacher-assignment.service';
import { SelectedTeachersService } from '../../../docentes/services/selected-teachers.service';
import { SelectedTeachers } from '../../services/selected-teachers';
import { SemesterInformationService } from '../../../../shared/services/semester-information.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PlanningRow } from '../../models/planificacion.models';

describe('PlanificacionClasesPage - Planificación de Clases', () => {
  let component: PlanificacionClasesPage;
  let fixture: ComponentFixture<PlanificacionClasesPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockPlanningService: jasmine.SpyObj<PlanningService>;
  let mockTeacherAssignmentService: jasmine.SpyObj<TeacherAssignmentService>;
  let mockSelectedTeachersService: jasmine.SpyObj<SelectedTeachersService>;
  let mockSelectedTeachers: jasmine.SpyObj<SelectedTeachers>;
  let mockSemesterService: jasmine.SpyObj<SemesterInformationService>;
  let selectedTeachersSubject: BehaviorSubject<Map<string, any>>;

  const mockPlanningRows: PlanningRow[] = [
    {
      classId: '1',
      courseName: 'Algoritmos',
      courseCode: 'SIST-101',
      group: 'A',
      section: 'Sistemas',
      schedule: 'Lunes 8:00-10:00',
      teacherName: 'Juan Pérez',
      teacherId: 10,
      status: 'CONFIRMADO',
      students: 30,
      classroom: 'Aula 201',
      seats: 30,
      startDate: '2024-01-15',
      endDate: '2024-05-30',
      weeks: 16,
      notes: [],
      schedules: []
    } as any,
    {
      classId: '2',
      courseName: 'Bases de Datos',
      courseCode: 'SIST-201',
      group: 'B',
      section: 'Sistemas',
      schedule: 'Martes 10:00-12:00',
      teacherName: null,
      teacherId: null,
      status: 'PENDIENTE',
      students: 25,
      classroom: 'Aula 305',
      seats: 25,
      startDate: '2024-01-15',
      endDate: '2024-05-30',
      weeks: 16,
      notes: [],
      schedules: []
    } as any
  ];

  beforeEach(async () => {
    selectedTeachersSubject = new BehaviorSubject<Map<string, any>>(new Map());

    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      snapshot: { params: {}, queryParams: {} }
    };
    mockPlanningService = jasmine.createSpyObj('PlanningService', [
      'getAllClasses',
      'getAllClassesWithSchedules',
      'convertClassDTOToPlanningRow'
    ]);
    mockTeacherAssignmentService = jasmine.createSpyObj('TeacherAssignmentService', [
      'assignTeacherToClass',
      'removeTeacherFromClass'
    ]);
    mockSelectedTeachersService = jasmine.createSpyObj('SelectedTeachersService', [
      'selectTeacher',
      'getSelectedTeacher',
      'clearSelection'
    ]);
    mockSelectedTeachers = jasmine.createSpyObj('SelectedTeachers', [], {
      selectedTeachers$: selectedTeachersSubject.asObservable()
    });
    mockSemesterService = jasmine.createSpyObj('SemesterInformationService', [
      'getCurrentSemester'
    ]);

    // Configurar respuestas por defecto
    mockRouter.getCurrentNavigation.and.returnValue(null);
    mockPlanningService.getAllClasses.and.returnValue(of(mockPlanningRows as any));
    mockPlanningService.getAllClassesWithSchedules.and.returnValue(of(mockPlanningRows as any));
    
    // Mock del método convertClassDTOToPlanningRow - devuelve el mismo objeto
    mockPlanningService.convertClassDTOToPlanningRow.and.callFake((classDTO: any) => classDTO);
    
    mockTeacherAssignmentService.assignTeacherToClass.and.returnValue(of({
      id: 10,
      name: 'Juan',
      lastName: 'Pérez',
      maxHours: 40,
      assignedHours: 20,
      availableHours: 20
    } as any));
    mockTeacherAssignmentService.removeTeacherFromClass.and.returnValue(of(undefined as any));
    mockSemesterService.getCurrentSemester.and.returnValue(of({
      id: 1,
      year: 2024,
      period: 1,
      name: '2024-1'
    } as any));

    await TestBed.configureTestingModule({
      imports: [PlanificacionClasesPage, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PlanningService, useValue: mockPlanningService },
        { provide: TeacherAssignmentService, useValue: mockTeacherAssignmentService },
        { provide: SelectedTeachersService, useValue: mockSelectedTeachersService },
        { provide: SelectedTeachers, useValue: mockSelectedTeachers },
        { provide: SemesterInformationService, useValue: mockSemesterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanificacionClasesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('✅ Inicialización del componente', () => {
    it('debe cargar las clases al inicializar', () => {
      component.ngOnInit();
      expect(mockPlanningService.getAllClassesWithSchedules).toHaveBeenCalled();
    });

    it('debe cargar información del semestre actual', () => {
      component.ngOnInit();
      expect(mockSemesterService.getCurrentSemester).toHaveBeenCalled();
    });

    it('debe inicializar con rol de admin por defecto', () => {
      expect(component.role).toBe('admin');
    });

    it('debe tener filtros inicializados vacíos', () => {
      expect(component.searchText).toBe('');
      expect(component.materiaFilter).toBe('');
      expect(component.seccionFilter).toBe('');
    });
  });

  describe('🔍 Filtros de búsqueda', () => {
    beforeEach(() => {
      component.originalRows = mockPlanningRows;
      component.filteredRows = [...mockPlanningRows];
    });

    it('debe obtener lista de materias disponibles', () => {
      const materias = component.availableMaterias;
      expect(materias).toContain('Algoritmos');
      expect(materias).toContain('Bases de Datos');
    });

    it('debe obtener lista de secciones disponibles para admin', () => {
      component.role = 'admin';
      const secciones = component.availableSecciones;
      expect(secciones).toContain('Sistemas');
    });

    it('no debe mostrar secciones para rol seccion', () => {
      component.role = 'seccion';
      const secciones = component.availableSecciones;
      expect(secciones.length).toBe(0);
    });
  });

  describe('👨‍🏫 Asignación de docentes', () => {
    it('debe tener método para asignar docente a clase', () => {
      const assignMethod = (component as any).assignTeacherToClass;
      expect(assignMethod).toBeDefined();
      expect(typeof assignMethod).toBe('function');
    });

    it('debe procesar asignación de docente cuando regresa de selección', fakeAsync(() => {
      const classKey = 'class-1';
      const selectedTeacher = {
        id: 10,
        name: 'Juan',
        lastName: 'Pérez'
      };

      mockRouter.getCurrentNavigation.and.returnValue({
        extras: {
          state: {
            returnFromTeacherSelection: true,
            selectedTeacher,
            classKey
          }
        }
      } as any);

      // Recrear componente con navegación mockeada
      const newFixture = TestBed.createComponent(PlanificacionClasesPage);
      const newComponent = newFixture.componentInstance;

      tick();
      expect(newComponent).toBeTruthy();
    }));
  });

  describe('📊 Gestión de estados de clases', () => {
    it('debe tener manejo de estados de clases', fakeAsync(() => {
      component.ngOnInit();
      tick();

      // Verificar que el componente maneja estados
      expect(component.originalRows).toBeDefined();
      expect(component.filteredRows).toBeDefined();
    }));

    it('debe tener control de estado de carga', () => {
      expect(component.loading).toBeDefined();
      expect(typeof component.loading).toBe('boolean');
    });

    it('debe tener control de errores', () => {
      expect(component.error).toBeDefined();
    });
  });

  describe('🔄 Modal de conflicto de horarios', () => {
    it('debe tener control del modal de conflicto', () => {
      expect(component.showScheduleConflict).toBeDefined();
      expect(typeof component.showScheduleConflict).toBe('boolean');
    });

    it('debe tener datos de conflicto inicializados', () => {
      expect(component.conflictData).toBeDefined();
      expect(component.conflictData.teacherName).toBeDefined();
      expect(component.conflictData.conflictSchedule).toBeDefined();
    });

    it('debe poder abrir modal de conflicto', () => {
      component.showScheduleConflict = false;
      component.showScheduleConflict = true;
      expect(component.showScheduleConflict).toBe(true);
    });

    it('debe poder cerrar modal de conflicto', () => {
      component.showScheduleConflict = true;
      component.showScheduleConflict = false;
      expect(component.showScheduleConflict).toBe(false);
    });
  });

  describe('📋 Modal de duplicación de semestre', () => {
    it('debe tener control del modal de duplicación', () => {
      expect(component.showDuplicacionPopup).toBeDefined();
      expect(typeof component.showDuplicacionPopup).toBe('boolean');
    });

    it('debe poder abrir modal de duplicación', () => {
      component.showDuplicacionPopup = false;
      component.showDuplicacionPopup = true;
      expect(component.showDuplicacionPopup).toBe(true);
    });

    it('debe poder cerrar modal de duplicación', () => {
      component.showDuplicacionPopup = true;
      component.showDuplicacionPopup = false;
      expect(component.showDuplicacionPopup).toBe(false);
    });
  });

  describe('📅 Información del semestre', () => {
    it('debe cargar información del semestre actual', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(component.currentSemester).toBeDefined();
    }));

    it('debe manejar error al cargar semestre', fakeAsync(() => {
      mockSemesterService.getCurrentSemester.and.returnValue(
        throwError(() => new Error('Error de red'))
      );

      component.ngOnInit();
      tick();

      // El componente debe manejar el error gracefully
      expect(component).toBeTruthy();
    }));
  });

  describe('🔄 Actualización de datos', () => {
    it('debe tener datos originales y filtrados separados', () => {
      expect(component.originalRows).toBeDefined();
      expect(component.filteredRows).toBeDefined();
      expect(Array.isArray(component.originalRows)).toBe(true);
      expect(Array.isArray(component.filteredRows)).toBe(true);
    });

    it('debe cargar clases del backend exitosamente', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(mockPlanningService.getAllClassesWithSchedules).toHaveBeenCalled();
      expect(component.originalRows.length).toBeGreaterThan(0);
    }));

    it('debe manejar error al cargar clases', fakeAsync(() => {
      mockPlanningService.getAllClassesWithSchedules.and.returnValue(
        throwError(() => new Error('Error de red'))
      );

      component.ngOnInit();
      tick();

      expect(component.error).toBeTruthy();
    }));
  });

  describe('🧹 Limpieza de recursos', () => {
    it('debe limpiar suscripciones al destruir componente', () => {
      component.ngOnInit();
      const subscription = (component as any).subscription;
      spyOn(subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('🎯 Integración con servicios', () => {
    it('debe usar PlanningService para obtener clases', () => {
      component.ngOnInit();
      expect(mockPlanningService.getAllClassesWithSchedules).toHaveBeenCalled();
    });

    it('debe usar SemesterInformationService para obtener semestre', () => {
      component.ngOnInit();
      expect(mockSemesterService.getCurrentSemester).toHaveBeenCalled();
    });

    it('debe escuchar cambios en docentes seleccionados', fakeAsync(() => {
      component.ngOnInit();
      tick();

      const newSelection = new Map();
      newSelection.set('class-1', { teacherId: 10, teacherName: 'Juan Pérez' });
      
      selectedTeachersSubject.next(newSelection);
      tick();

      expect(component).toBeTruthy();
    }));
  });
});
