import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MonitorFormPageComponent } from './monitor-form-page.component';
import { ProgramasService } from '../../../formulario-programas/services/programas.service';
import { SectionsService } from '../../../../shared/services/sections.service';
import { StudentApplicationService } from '../../services/student-application.service';
import { UserInformationService } from '../../../../shared/services/user-information.service';
import { ParametricService } from '../../../../shared/services/parametric.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MonitorFormPageComponent - Formulario de Monitores', () => {
  let component: MonitorFormPageComponent;
  let fixture: ComponentFixture<MonitorFormPageComponent>;
  let mockProgramasService: jasmine.SpyObj<ProgramasService>;
  let mockSectionsService: jasmine.SpyObj<SectionsService>;
  let mockStudentApplicationService: jasmine.SpyObj<StudentApplicationService>;
  let mockUserInformationService: jasmine.SpyObj<UserInformationService>;
  let mockParametricService: jasmine.SpyObj<ParametricService>;

  beforeEach(async () => {
    // Crear mocks de servicios
    mockProgramasService = jasmine.createSpyObj('ProgramasService', [
      'getAllCourseOptions'
    ]);
    mockSectionsService = jasmine.createSpyObj('SectionsService', [
      'getAllSections'
    ]);
    mockStudentApplicationService = jasmine.createSpyObj('StudentApplicationService', [
      'submitApplication'
    ]);
    mockUserInformationService = jasmine.createSpyObj('UserInformationService', [
      'getUserInformation'
    ]);
    mockParametricService = jasmine.createSpyObj('ParametricService', [
      'getDocumentTypeById'
    ]);

    // Configurar respuestas por defecto
    mockProgramasService.getAllCourseOptions.and.returnValue(of([]));
    mockSectionsService.getAllSections.and.returnValue(of([]));
    mockStudentApplicationService.submitApplication.and.returnValue(of({} as any));
    mockUserInformationService.getUserInformation.and.returnValue(of({
      id: 1,
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@javeriana.edu.co',
      documentNumber: '1234567890',
      documentTypeId: 1
    } as any));
    mockParametricService.getDocumentTypeById.and.returnValue(of('CC'));

    await TestBed.configureTestingModule({
      imports: [MonitorFormPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ProgramasService, useValue: mockProgramasService },
        { provide: SectionsService, useValue: mockSectionsService },
        { provide: StudentApplicationService, useValue: mockStudentApplicationService },
        { provide: UserInformationService, useValue: mockUserInformationService },
        { provide: ParametricService, useValue: mockParametricService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorFormPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('✅ Inicialización del componente', () => {
    it('debe cargar información del usuario al inicializar', () => {
      component.ngOnInit();
      expect(mockUserInformationService.getUserInformation).toHaveBeenCalled();
    });

    it('debe cargar lista de asignaturas', () => {
      component.ngOnInit();
      expect(mockProgramasService.getAllCourseOptions).toHaveBeenCalled();
    });

    it('debe cargar lista de secciones', () => {
      component.ngOnInit();
      expect(mockSectionsService.getAllSections).toHaveBeenCalled();
    });

    it('debe inicializar con tipo de monitoría académico por defecto', () => {
      expect(component.monitorType).toBe('academic');
    });

    it('debe tener al menos una fila de disponibilidad inicial', () => {
      expect(component.availabilityRows.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('📋 Gestión de tipo de monitoría', () => {
    it('debe permitir cambiar entre monitoría académica y administrativa', () => {
      component.monitorType = 'administrative';
      expect(component.monitorType).toBe('administrative');

      component.monitorType = 'academic';
      expect(component.monitorType).toBe('academic');
    });

    it('debe tener definido el estado de "ha sido monitor"', () => {
      expect(component.hasBeenMonitor).toBeDefined();
    });
  });

  describe('⏰ Gestión de horarios de disponibilidad', () => {
    it('debe calcular total de horas disponibles', () => {
      component.availabilityRows = [
        { day: 'LUN', start: '08:00', end: '10:00', total: 2 },
        { day: 'MAR', start: '14:00', end: '17:00', total: 3 }
      ];
      
      expect(component.totalAvailabilityHours).toBe(5);
    });

    it('debe manejar filas sin horas definidas', () => {
      component.availabilityRows = [
        { day: '', start: '', end: '', total: 0 }
      ];
      
      expect(component.totalAvailabilityHours).toBe(0);
    });
  });

  describe('📤 Validación y envío del formulario', () => {
    it('debe tener control del popup de confirmación', () => {
      expect(component.showConfirmPopup).toBeDefined();
      expect(typeof component.showConfirmPopup).toBe('boolean');
    });

    it('debe tener control del estado de envío', () => {
      expect(component.isSubmitting).toBeDefined();
      expect(typeof component.isSubmitting).toBe('boolean');
    });

    it('debe mostrar modal de éxito después de envío exitoso', async () => {
      mockStudentApplicationService.submitApplication.and.returnValue(of({ success: true }));
      
      // Simular evento de formulario
      const mockForm = document.createElement('form');
      const mockEvent = new Event('submit') as any;
      Object.defineProperty(mockEvent, 'target', { value: mockForm, writable: false });
      
      // Acceder a propiedad privada usando corchetes
      (component as any)['_lastFormEvent'] = mockEvent;
      
      await component.onConfirmSend();
      
      expect(component.showSuccessModal).toBe(true);
      expect(component.isSubmitting).toBe(false);
    });

    it('debe manejar errores al enviar el formulario', async () => {
      mockStudentApplicationService.submitApplication.and.returnValue(
        throwError(() => new Error('Error de red'))
      );
      
      const mockForm = document.createElement('form');
      const mockEvent = new Event('submit') as any;
      Object.defineProperty(mockEvent, 'target', { value: mockForm, writable: false });
      
      // Acceder a propiedad privada usando corchetes
      (component as any)['_lastFormEvent'] = mockEvent;
      
      await component.onConfirmSend();
      
      expect(component.isSubmitting).toBe(false);
      expect(component.formError).toBeTruthy();
    });
  });

  describe('🔄 Estados de carga', () => {
    it('debe controlar estado de carga de asignaturas', () => {
      expect(component.loadingSubjects).toBeDefined();
      expect(typeof component.loadingSubjects).toBe('boolean');
    });

    it('debe controlar estado de carga de secciones', () => {
      expect(component.loadingSections).toBeDefined();
      expect(typeof component.loadingSections).toBe('boolean');
    });
  });

  describe('✅ Modal de éxito', () => {
    it('debe tener control del modal de éxito', () => {
      expect(component.showSuccessModal).toBeDefined();
      expect(typeof component.showSuccessModal).toBe('boolean');
    });

    it('debe cerrar modal de éxito correctamente', () => {
      component.showSuccessModal = true;
      component.onSuccessModalClose();
      expect(component.showSuccessModal).toBe(false);
    });
  });

  describe('📊 Información del estudiante', () => {
    it('debe cargar y mostrar datos del estudiante', () => {
      component.ngOnInit();
      
      fixture.detectChanges();
      
      expect(component.firstName).toBeDefined();
      expect(component.lastName).toBeDefined();
      expect(component.institutionalEmail).toBeDefined();
    });

    it('debe tener valores por defecto si no hay información', () => {
      expect(component.documentType).toBe('N/A');
      expect(component.firstName).toBe('N/A');
      expect(component.lastName).toBe('N/A');
    });
  });

  describe('✅ CRUD - Crear Monitor Completo', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('debe crear un monitor académico completo y enviarlo al backend', (done) => {
      // Configurar mock para retornar éxito
      mockStudentApplicationService.submitApplication.and.returnValue(of({
        success: true,
        message: 'Solicitud de monitor creada exitosamente',
        applicationId: 123
      } as any));

      // Configurar datos del formulario usando propiedades reales
      component.monitorType = 'academic';
      component.hasBeenMonitor = false;
      component.availabilityRows = [
        { day: '', start: '08:00', end: '10:00', total: 2 },
        { day: '', start: '14:00', end: '16:00', total: 2 }
      ];

      // Crear un formulario mock
      const mockForm = document.createElement('form');
      mockForm.innerHTML = `
        <input id="career" value="Ingeniería de Sistemas">
        <input id="semester" value="5">
        <input id="average" value="4.2">
        <input id="cellphone" value="3001234567">
        <input id="altPhone" value="3109876543">
        <input id="address" value="Calle 123">
        <input id="altEmail" value="juan@email.com">
        <input name="hasBeenMonitor" type="radio" value="false" checked>
      `;

      (component as any)._lastFormEvent = { target: mockForm } as any;
      component.onConfirmSend();

      setTimeout(() => {
        expect(mockStudentApplicationService.submitApplication).toHaveBeenCalled();
        const payload = mockStudentApplicationService.submitApplication.calls.mostRecent().args[0];
        expect(payload).toBeDefined();
        expect(payload.program).toBe('Ingeniería de Sistemas');
        done();
      }, 100);
    });

    it('debe guardar el monitor en backend y mostrar modal de éxito', (done) => {
      const expectedResponse = {
        success: true,
        message: 'Monitor registrado exitosamente',
        applicationId: 456
      };

      mockStudentApplicationService.submitApplication.and.returnValue(of(expectedResponse as any));

      component.monitorType = 'academic';
      const mockForm = document.createElement('form');
      mockForm.innerHTML = `
        <input id="career" value="Ingeniería">
        <input id="semester" value="6">
        <input id="average" value="4.0">
        <input id="cellphone" value="3001111111">
        <input id="altPhone" value="">
        <input id="address" value="Dirección">
        <input id="altEmail" value="email@test.com">
      `;

      (component as any)._lastFormEvent = { target: mockForm } as any;
      component.onConfirmSend();

      setTimeout(() => {
        expect(mockStudentApplicationService.submitApplication).toHaveBeenCalled();
        expect(component.showSuccessModal).toBe(true);
        done();
      }, 100);
    });

    it('debe mostrar popup de confirmación antes de enviar', () => {
      component.showConfirmPopup = false;
      
      const mockForm = document.createElement('form');
      mockForm.checkValidity = () => true;
      const mockEvent = {
        target: mockForm,
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;

      component.onSubmit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.showConfirmPopup).toBe(true);
    });

    it('debe manejar error al crear monitor y mostrar mensaje', (done) => {
      const errorResponse = {
        error: 'Error al crear solicitud',
        message: 'El usuario ya tiene una solicitud pendiente'
      };

      mockStudentApplicationService.submitApplication.and.returnValue(
        throwError(() => errorResponse)
      );

      component.monitorType = 'academic';
      const mockForm = document.createElement('form');
      mockForm.innerHTML = `<input id="career" value="Test">`;

      (component as any)._lastFormEvent = { target: mockForm } as any;
      component.onConfirmSend();

      setTimeout(() => {
        expect(component.formError).toBeTruthy();
        expect(component.isSubmitting).toBe(false);
        done();
      }, 100);
    });

    it('debe permitir agregar múltiples horarios de disponibilidad', () => {
      component.availabilityRows = [
        { day: '', start: '08:00', end: '10:00', total: 2 }
      ];

      component.availabilityRows.push({ day: '', start: '14:00', end: '16:00', total: 2 });
      component.availabilityRows.push({ day: '', start: '10:00', end: '12:00', total: 2 });

      expect(component.availabilityRows.length).toBe(3);
    });

    it('debe permitir crear monitor académico', (done) => {
      mockStudentApplicationService.submitApplication.and.returnValue(of({
        success: true,
        applicationId: 789
      } as any));

      component.monitorType = 'academic';
      component.availabilityRows = [
        { day: '', start: '08:00', end: '10:00', total: 2 }
      ];
      
      const mockForm = document.createElement('form');
      mockForm.innerHTML = `
        <input id="career" value="Sistemas">
        <input id="semester" value="7">
        <input id="average" value="4.5">
        <input id="cellphone" value="3001234567">
        <input id="altPhone" value="">
        <input id="address" value="Calle 1">
        <input id="altEmail" value="test@test.com">
        <select id="courseSelect"><option value="101">Algoritmos</option></select>
      `;

      (component as any)._lastFormEvent = { target: mockForm };
      component.onConfirmSend();

      setTimeout(() => {
        expect(mockStudentApplicationService.submitApplication).toHaveBeenCalled();
        const payload = mockStudentApplicationService.submitApplication.calls.mostRecent().args[0];
        expect(payload).toBeDefined();
        done();
      }, 100);
    });

    it('debe permitir crear monitor administrativo', (done) => {
      mockStudentApplicationService.submitApplication.and.returnValue(of({
        success: true,
        applicationId: 999
      } as any));

      component.monitorType = 'administrative';
      component.availabilityRows = [
        { day: '', start: '14:00', end: '16:00', total: 2 }
      ];
      
      const mockForm = document.createElement('form');
      mockForm.innerHTML = `
        <input id="career" value="Admin">
        <input id="semester" value="8">
        <input id="average" value="4.3">
        <input id="cellphone" value="3009999999">
        <input id="altPhone" value="">
        <input id="address" value="Calle 2">
        <input id="altEmail" value="admin@test.com">
        <select id="sectionSelect"><option value="201">Administración</option></select>
      `;

      (component as any)._lastFormEvent = { target: mockForm };
      component.onConfirmSend();

      setTimeout(() => {
        expect(mockStudentApplicationService.submitApplication).toHaveBeenCalled();
        const payload = mockStudentApplicationService.submitApplication.calls.mostRecent().args[0];
        expect(payload).toBeDefined();
        done();
      }, 100);
    });

    it('debe limpiar formulario después de envío exitoso', (done) => {
      mockStudentApplicationService.submitApplication.and.returnValue(of({
        success: true,
        applicationId: 111
      } as any));

      component.monitorType = 'academic';
      component.hasBeenMonitor = true;
      component.availabilityRows = [
        { day: '', start: '08:00', end: '10:00', total: 2 },
        { day: '', start: '14:00', end: '16:00', total: 2 }
      ];

      const mockForm = document.createElement('form');
      mockForm.innerHTML = `<input id="career" value="Test">`;
      mockForm.reset = jasmine.createSpy('reset');

      (component as any)._lastFormEvent = { target: mockForm } as any;
      component.onConfirmSend();

      setTimeout(() => {
        expect(mockForm.reset).toHaveBeenCalled();
        expect(component.availabilityRows.length).toBe(1);
        expect(component.monitorType).toBe('academic');
        done();
      }, 100);
    });
  });
});
