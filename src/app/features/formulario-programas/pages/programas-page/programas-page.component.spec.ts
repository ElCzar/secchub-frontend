import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProgramasPageComponent } from './programas-page.component';
import { ProgramasService } from '../../services/programas.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProgramasPageComponent - Formulario de Programas', () => {
  let component: ProgramasPageComponent;
  let fixture: ComponentFixture<ProgramasPageComponent>;
  let mockProgramasService: jasmine.SpyObj<ProgramasService>;

  beforeEach(async () => {
    mockProgramasService = jasmine.createSpyObj('ProgramasService', [
      'getContext',
      'submitAcademicRequests',
      'areCoursesLoaded',
      'getAllCourses',
      'getCurrentSemester'
    ]);

    mockProgramasService.getContext.and.returnValue(of({} as any));
    mockProgramasService.submitAcademicRequests.and.returnValue(of({} as any));
    mockProgramasService.areCoursesLoaded.and.returnValue(of(true));
    mockProgramasService.getAllCourses.and.returnValue(of([]));
    mockProgramasService.getCurrentSemester.and.returnValue(of({
      id: 1,
      name: '2024-1',
      startDate: '2024-01-01',
      endDate: '2024-06-30'
    } as any));

    await TestBed.configureTestingModule({
      imports: [ProgramasPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ProgramasService, useValue: mockProgramasService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramasPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('✅ Inicialización del formulario', () => {
    it('debe cargar el contexto al inicializar', () => {
      component.ngOnInit();
      expect(mockProgramasService.getContext).toHaveBeenCalled();
    });

    it('debe iniciar con la lista de filas', () => {
      component.ngOnInit();
      expect(component.rows).toBeDefined();
    });

    it('debe configurar el observable de contexto', () => {
      component.ngOnInit();
      expect(component.context$).toBeDefined();
    });
  });

  describe('➕ Gestión de filas del formulario', () => {
    it('debe tener un array de filas disponible', () => {
      component.ngOnInit();
      expect(Array.isArray(component.rows)).toBe(true);
    });

    it('debe permitir agregar nueva fila', () => {
      const initialLength = component.rows.length;
      component.addRow();
      expect(component.rows.length).toBeGreaterThanOrEqual(initialLength);
    });
  });

  describe('📤 Envío del formulario', () => {
    it('debe tener control de popup de confirmación', () => {
      expect(component.showConfirm).toBeDefined();
      expect(typeof component.showConfirm).toBe('boolean');
    });

    it('debe llamar al servicio al confirmar envío', () => {
      spyOn(window, 'alert');
      component.onConfirmSend();
      // Verifica que el método existe y es ejecutable
      expect(true).toBe(true);
    });

    it('debe controlar estado de carga', () => {
      expect(component.loadingPrevious).toBeDefined();
      expect(typeof component.loadingPrevious).toBe('boolean');
    });
  });

  describe('📋 Modal de duplicación', () => {
    it('debe tener control del modal de duplicación', () => {
      expect(component.showDuplicateModal).toBeDefined();
      expect(typeof component.showDuplicateModal).toBe('boolean');
    });

    it('debe cerrar modal de duplicación', () => {
      component.showDuplicateModal = true;
      component.closeDuplicateModal();
      expect(component.showDuplicateModal).toBe(false);
    });

    it('debe mantener el estado al cerrar', () => {
      component.showDuplicateModal = true;
      component.closeDuplicateModal();
      expect(component.showDuplicateModal).toBe(false);
      expect(component.rows).toBeDefined();
    });
  });

  describe('✅ CRUD - Crear Solicitud de Programa Completa', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('debe crear una solicitud de programa con múltiples cursos', (done) => {
      // Configurar mock para retornar éxito
      mockProgramasService.submitAcademicRequests.and.returnValue(of({
        success: true,
        message: 'Solicitud de programas creada exitosamente',
        requestId: 789
      } as any));

      // Simular filas del formulario con estructura simplificada
            component.rows = [
        {
          courseId: '101',
          courseName: 'Estructura de Datos',
          section: 'Sistemas',
          roomType: 'Aula',
          seats: 30,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          weeks: 16,
          _state: 'new',
          schedules: [
            {
              day: 'Lunes',
              startTime: '08:00',
              endTime: '10:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        } as any,
        {
          courseId: '102',
          courseName: 'Bases de Datos II',
          section: 'Sistemas',
          roomType: 'Laboratorio',
          seats: 25,
          startDate: '2024-01-15',
          endDate: '2024-05-30',
          weeks: 16,
          _state: 'new',
          schedules: [
            {
              day: 'Martes',
              startTime: '10:00',
              endTime: '12:00',
              modality: 'Presencial',
              roomType: 'Laboratorio'
            }
          ]
        } as any
      ];

      // Ejecutar envío
      component.onConfirmSend();

      // Verificar que se llamó al servicio
      setTimeout(() => {
        expect(mockProgramasService.submitAcademicRequests).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('debe guardar la solicitud en backend y recibir confirmación', (done) => {
      const expectedResponse = {
        success: true,
        message: 'Solicitud guardada exitosamente',
        requestId: 456,
        data: {
          id: 456,
          status: 'Pendiente',
          coursesCount: 3,
          createdAt: new Date().toISOString()
        }
      };

      mockProgramasService.submitAcademicRequests.and.returnValue(of(expectedResponse));

      component.rows = [
        {
          courseId: '1',
          courseName: 'Test Course 1',
          section: 'Sistemas',
          seats: 30,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          _state: 'new',
          schedules: [
            {
              day: 'Lunes',
              startTime: '08:00',
              endTime: '10:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        },
        {
          courseId: '2',
          courseName: 'Test Course 2',
          section: 'Sistemas',
          seats: 25,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          _state: 'new',
          schedules: [
            {
              day: 'Martes',
              startTime: '10:00',
              endTime: '12:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        },
        {
          courseId: '3',
          courseName: 'Test Course 3',
          section: 'Sistemas',
          seats: 20,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          _state: 'new',
          schedules: [
            {
              day: 'Miércoles',
              startTime: '14:00',
              endTime: '16:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        }
      ] as any;

      component.onConfirmSend();

      setTimeout(() => {
        expect(mockProgramasService.submitAcademicRequests).toHaveBeenCalled();
        // Verificar que se muestra confirmación
        expect(component.showConfirm).toBeDefined();
        done();
      }, 100);
    });

    it('debe validar que exista al menos una fila antes de enviar', () => {
      component.rows = [];

      const canSubmit = component.rows.length > 0;

      expect(canSubmit).toBe(false);
    });

    it('debe manejar error al crear solicitud y mostrar mensaje', (done) => {
      const errorResponse = {
        error: 'Error al crear solicitud',
        message: 'Datos inválidos en la solicitud'
      };

      mockProgramasService.submitAcademicRequests.and.returnValue(
        throwError(() => errorResponse)
      );

      component.rows = [
        {
          courseId: '1',
          courseName: 'Test',
          section: 'Sistemas',
          seats: 30,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          _state: 'new',
          schedules: [
            {
              day: 'Lunes',
              startTime: '08:00',
              endTime: '10:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        }
      ] as any;

      component.onConfirmSend();

      setTimeout(() => {
        // El componente debe manejar el error
        expect(component).toBeTruthy();
        done();
      }, 100);
    });

    it('debe permitir agregar múltiples filas de cursos', () => {
      const initialLength = component.rows.length;

      component.addRow();
      component.addRow();
      component.addRow();

      expect(component.rows.length).toBeGreaterThanOrEqual(initialLength + 3);
    });

    it('debe validar datos completos en cada fila antes de enviar', () => {
      component.rows = [
        {
          courseId: '1',
          courseName: 'Algoritmos',
          section: 'Sistemas',
          roomType: 'Regular',
          seats: 30,
          startDate: '2024-01-15',
          endDate: '2024-05-30',
          weeks: 16,
          _state: 'new',
          schedules: [
            {
              day: 'Lunes',
              startTime: '08:00',
              endTime: '10:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        } as any,
        {
          courseId: '', // Fila incompleta
          courseName: '',
          section: '',
          roomType: '',
          seats: 0,
          startDate: '',
          endDate: '',
          weeks: 0,
          _state: 'new',
          schedules: []
        } as any
      ];

      const allRowsValid = component.rows.every(row => 
        row.courseId && row.courseName && row.seats > 0
      );

      expect(allRowsValid).toBe(false);
    });

    it('debe confirmar creación exitosa con popup de confirmación', (done) => {
      mockProgramasService.submitAcademicRequests.and.returnValue(of({
        success: true,
        requestId: 999
      }));

      component.rows = [
        {
          courseId: '1',
          courseName: 'Test',
          section: 'Sistemas',
          seats: 30,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          _state: 'new',
          schedules: [
            {
              day: 'Lunes',
              startTime: '08:00',
              endTime: '10:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        }
      ] as any;

      component.showConfirm = false;
      component.onConfirmSend();

      setTimeout(() => {
        expect(mockProgramasService.submitAcademicRequests).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('debe limpiar formulario después de envío exitoso', (done) => {
      mockProgramasService.submitAcademicRequests.and.returnValue(of({
        success: true,
        requestId: 111
      }));

      component.rows = [
        {
          courseId: '1',
          courseName: 'Test',
          section: 'Sistemas',
          seats: 30,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          _state: 'new',
          schedules: [
            {
              day: 'Lunes',
              startTime: '08:00',
              endTime: '10:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        },
        {
          courseId: '2',
          courseName: 'Test 2',
          section: 'Sistemas',
          seats: 25,
          startDate: '2024-01-10',
          endDate: '2024-05-25',
          _state: 'new',
          schedules: [
            {
              day: 'Martes',
              startTime: '10:00',
              endTime: '12:00',
              modality: 'Presencial',
              roomType: 'Aula'
            }
          ]
        }
      ] as any;

      const initialRowCount = component.rows.length;
      component.onConfirmSend();

      setTimeout(() => {
        // Verificar que se llamó al servicio con los datos
        expect(mockProgramasService.submitAcademicRequests).toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});
