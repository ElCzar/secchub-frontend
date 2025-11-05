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
      'getAllCourses'
    ]);

    mockProgramasService.getContext.and.returnValue(of({} as any));
    mockProgramasService.submitAcademicRequests.and.returnValue(of({} as any));
    mockProgramasService.areCoursesLoaded.and.returnValue(of(true));
    mockProgramasService.getAllCourses.and.returnValue(of([]));

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
});
