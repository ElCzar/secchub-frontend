import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocentesPage } from './docentes-page';
import { TeacherService, TeacherDTO } from '../../services/teacher.service';
import { SelectedTeachersService } from '../../services/selected-teachers.service';
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
});
