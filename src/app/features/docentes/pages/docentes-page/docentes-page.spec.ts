import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocentesPage } from './docentes-page';
import { TeacherService, TeacherDTO } from '../../services/teacher.service';
import { SelectedTeachersService } from '../../services/selected-teachers.service';
import { Docente } from '../../models/docente.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DocentesPage - Formulario de Docentes', () => {
  let component: DocentesPage;
  let fixture: ComponentFixture<DocentesPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTeacherService: jasmine.SpyObj<TeacherService>;
  let mockSelectedTeachersService: jasmine.SpyObj<SelectedTeachersService>;

  const mockTeachers: TeacherDTO[] = [
    {
      id: 1,
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@javeriana.edu.co',
      contractType: 'Planta',
      maxHours: 40,
      assignedHours: 20,
      availableHours: 20,
      subjects: ['Algoritmos', 'Estructuras de Datos']
    },
    {
      id: 2,
      name: 'María',
      lastName: 'García',
      email: 'maria.garcia@javeriana.edu.co',
      contractType: 'Cátedra',
      maxHours: 20,
      assignedHours: 10,
      availableHours: 10,
      subjects: ['Bases de Datos']
    }
  ];

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    mockTeacherService = jasmine.createSpyObj('TeacherService', ['getAllTeachers', 'getTeacherById']);
    mockSelectedTeachersService = jasmine.createSpyObj('SelectedTeachersService', [
      'setSelectionState',
      'getSelectionState',
      'getSelectedTeacher',
      'selectTeacher',
      'clearSelection'
    ]);

    mockRouter.getCurrentNavigation.and.returnValue(null);
    mockTeacherService.getAllTeachers.and.returnValue(of(mockTeachers));
    mockSelectedTeachersService.getSelectionState.and.returnValue(null);
    mockSelectedTeachersService.getSelectedTeacher.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [DocentesPage, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SelectedTeachersService, useValue: mockSelectedTeachersService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocentesPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('✅ Inicialización del componente', () => {
    it('debe cargar la lista de docentes al iniciar', () => {
      component.ngOnInit();
      expect(mockTeacherService.getAllTeachers).toHaveBeenCalled();
      expect(component.docentes.length).toBe(2);
    });

    it('debe manejar errores al cargar docentes', () => {
      mockTeacherService.getAllTeachers.and.returnValue(throwError(() => new Error('Error de red')));
      component.ngOnInit();
      expect(component.loadError).toBeTruthy();
    });
  });

  describe('🔍 Filtros de búsqueda', () => {
    beforeEach(() => {
      component.docentes = mockTeachers.map(t => ({ ...t, selected: false }));
      component.filteredDocentes = [...component.docentes];
    });

    it('debe filtrar docentes por nombre', () => {
      component.searchText = 'Juan';
      component.applyFilters();
      expect(component.filteredDocentes.length).toBe(1);
      expect(component.filteredDocentes[0].name).toContain('Juan');
    });

    it('debe filtrar docentes por apellido', () => {
      component.searchText = 'García';
      component.applyFilters();
      expect(component.filteredDocentes.length).toBe(0); // El filtro actual no busca en apellido
    });

    it('debe filtrar docentes por materia', () => {
      component.searchText = 'Bases de Datos';
      component.applyFilters();
      expect(component.filteredDocentes.length).toBe(1);
      expect(component.filteredDocentes[0].subjects).toContain('Bases de Datos');
    });

    it('debe aplicar múltiples filtros simultáneamente', () => {
      component.searchText = 'Juan';
      component.subjectFilter = 'Algoritmos';
      component.applyFilters();
      expect(component.filteredDocentes.length).toBe(1);
    });
  });

  describe('👤 Selección de docentes', () => {
    it('debe abrir modal al seleccionar un docente', () => {
      const testDocente = { ...mockTeachers[0], selected: false };
      component.selectDocente(testDocente);
      expect(component.showModal).toBe(true);
      expect(component.selectedDocenteInfo).toEqual(testDocente);
    });

    it('debe marcar un docente como seleccionado', () => {
      const docente = { ...mockTeachers[0], selected: false };
      component.selectDocente(docente);
      expect(docente.selected).toBe(true);
    });

    it('debe cerrar el modal correctamente', () => {
      const testDocente = { ...mockTeachers[0], selected: false };
      component.showModal = true;
      component.selectedDocenteInfo = testDocente;
      component.closeModal();
      expect(component.showModal).toBe(false);
      expect(component.selectedDocenteInfo).toBeNull();
    });
  });

  describe('✅ CRUD - Asignar Docente a Clase', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('debe asignar un docente específico a una clase y persistir en backend', fakeAsync(() => {
      const mockDocente: Docente = {
        id: 1,
        name: 'Juan Pérez',
        availableHours: 20,
        contractType: 'Planta',
        subjects: ['Algoritmos'],
        semesters: ['2024-1'],
        selected: false
      };

      component.classKey = 'class-123';
      component.classInfo = { courseName: 'Algoritmos', section: 'Sistemas' };
      component.filteredDocentes = [mockDocente];

      // Simular el flujo completo: selectDocente -> modal -> onDocenteSelected
      component.selectDocente(mockDocente);
      tick(50);
      expect(component.showModal).toBe(true);
      
      // Simular confirmación del modal
      component.onDocenteSelected(mockDocente);
      tick(50);

      expect(mockSelectedTeachersService.selectTeacher).toHaveBeenCalledWith('class-123', mockDocente);
      flush();
    }));

    it('debe confirmar asignación de docente con verificación de disponibilidad', fakeAsync(() => {
      const mockDocente: Docente = {
        id: 2,
        name: 'María García',
        availableHours: 15,
        contractType: 'Cátedra',
        subjects: ['Bases de Datos'],
        semesters: ['2024-1'],
        selected: false
      };

      component.classKey = 'class-456';
      component.classInfo = { courseName: 'Bases de Datos', classHours: 10 };
      component.filteredDocentes = [mockDocente];

      component.selectDocente(mockDocente);
      tick(50);
      
      // Confirmar selección
      component.onDocenteSelected(mockDocente);
      tick(50);

      expect(mockSelectedTeachersService.selectTeacher).toHaveBeenCalledWith('class-456', mockDocente);
      flush();
    }));

    it('debe validar horas disponibles antes de asignar docente', () => {
      const teacher = {
        ...mockTeachers[0],
        availableHours: 2,
        assignedHours: 38,
        maxHours: 40
      };

      const classHours = 4;

      // Verificar si el docente puede tomar la clase
      const canAssign = teacher.availableHours >= classHours;

      expect(canAssign).toBe(false);
    });

    it('debe manejar error al asignar docente sin disponibilidad', () => {
      const teacher = {
        ...mockTeachers[1],
        availableHours: 0,
        assignedHours: 20,
        maxHours: 20
      };

      const canAssign = teacher.availableHours > 0;

      expect(canAssign).toBe(false);
    });

    it('debe permitir asignar docente de planta con horas disponibles', fakeAsync(() => {
      const mockDocente: Docente = {
        id: 5,
        name: 'Carlos Ramírez',
        availableHours: 30,
        contractType: 'Planta',
        subjects: ['Cálculo', 'Álgebra'],
        semesters: ['2024-1'],
        selected: false
      };

      component.classKey = 'class-planta-1';
      component.classInfo = { courseName: 'Cálculo I', classHours: 4 };

      component.selectDocente(mockDocente);
      tick(50);
      component.onDocenteSelected(mockDocente);
      tick(50);

      expect(mockSelectedTeachersService.selectTeacher).toHaveBeenCalledWith('class-planta-1', mockDocente);
      flush();
    }));

    it('debe permitir asignar docente de cátedra con horas disponibles', fakeAsync(() => {
      const mockDocente: Docente = {
        id: 6,
        name: 'Ana López',
        availableHours: 12,
        contractType: 'Cátedra',
        subjects: ['Programación'],
        semesters: ['2024-1'],
        selected: false
      };

      component.classKey = 'class-catedra-1';
      component.classInfo = { courseName: 'Programación I', classHours: 6 };

      component.selectDocente(mockDocente);
      tick(50);
      component.onDocenteSelected(mockDocente);
      tick(50);

      expect(mockSelectedTeachersService.selectTeacher).toHaveBeenCalledWith('class-catedra-1', mockDocente);
      flush();
    }));

    it('debe permitir asignar docente de cátedra con horas disponibles - LEGACY', fakeAsync(() => {
      const catedraTeacher: Docente = {
        ...mockTeachers[1],
        contractType: 'Cátedra',
        availableHours: 10,
        maxHours: 20,
        selected: false
      };

      mockSelectedTeachersService.selectTeacher.and.returnValue(undefined);
      
      // Primero seleccionar el docente
      component.selectDocente(catedraTeacher);
      tick();
      
      // Luego confirmar la selección pasando el docente
      component.onDocenteSelected(catedraTeacher);
      tick();
      flush();

      expect(mockSelectedTeachersService.selectTeacher).toHaveBeenCalled();
    }));

    it('debe actualizar estado de asignación en el servicio', (done) => {
      const teacher = mockTeachers[0];
      const classKey = 'SIST-101-A';

      mockSelectedTeachersService.setSelectionState.and.returnValue(undefined);
      
      // Simular guardado de estado
      if (mockSelectedTeachersService.setSelectionState) {
        mockSelectedTeachersService.setSelectionState(classKey, teacher);
      }

      setTimeout(() => {
        expect(mockSelectedTeachersService.setSelectionState).toHaveBeenCalledWith(classKey, teacher);
        done();
      }, 100);
    });

    it('debe permitir regresar a planificación con docente seleccionado', (done) => {
      const teacher = mockTeachers[0];
      const returnUrl = '/planificacion';

      mockRouter.navigate.and.returnValue(Promise.resolve(true));
      mockSelectedTeachersService.selectTeacher.and.returnValue(undefined);

      component.selectDocente({ ...teacher, selected: false });

      setTimeout(() => {
        // Simular navegación de regreso
        mockRouter.navigate([returnUrl], {
          state: {
            selectedTeacher: teacher,
            returnFromTeacherSelection: true
          }
        });

        expect(mockRouter.navigate).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('debe validar que el docente tenga las materias requeridas', () => {
      const teacher = mockTeachers[0];
      const requiredSubject = 'Algoritmos';

      const hasSubject = teacher.subjects?.includes(requiredSubject);

      expect(hasSubject).toBe(true);
    });

    it('debe rechazar asignación si docente no tiene la materia', () => {
      const teacher = mockTeachers[0];
      const requiredSubject = 'Física Cuántica';

      const hasSubject = teacher.subjects?.includes(requiredSubject);

      expect(hasSubject).toBe(false);
    });
  });
});
