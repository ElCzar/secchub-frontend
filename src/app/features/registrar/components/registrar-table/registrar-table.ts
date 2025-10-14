import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { PersonalDataForm } from '../personal-data-form/personal-data-form';
import { ProfesorRegistrarComponent } from '../profesor-registrar/profesor-registrar.component';
import { SeccionRegistrarComponent } from '../seccion-registrar/seccion-registrar';
import { EstudianteRegistrarComponent } from '../estudiante-registrar/estudiante-registrar.component';
import { AdminRegistrarComponent } from '../administrador-registrar/administrador-registrar';
import { ProgramaRegistrarComponent } from '../programa-registrar/programa-registrar.component';
import { UserRegisterRequestDTO } from '../../models/user.model';
import { TeacherRegisterRequestDTO, TeacherResponseDTO } from '../../models/teacher.model';
import { SectionRegisterRequestDTO, SectionResponseDTO } from '../../models/section.models';
import { RegistrationResult } from '../../models/common.model';
import { PopConfimacion } from '../pop-confimacion/pop-confimacion';

@Component({
  selector: 'app-registrar-table',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    PopConfimacion,
    PersonalDataForm,
    ProfesorRegistrarComponent,
    SeccionRegistrarComponent,
    EstudianteRegistrarComponent,
    AdminRegistrarComponent,
    ProgramaRegistrarComponent
  ],
  templateUrl: './registrar-table.html',
  styleUrl: './registrar-table.scss'
})
export class RegistrarTableComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  
  // Popup de confirmación
  showConfirmationPopup = false;
  registrationResult: RegistrationResult | null = null;

  // Opciones para los selects  
  userRoles = [
    { id: 'admin', name: 'Administrador' },
    { id: 'student', name: 'Estudiante' },
    { id: 'teacher', name: 'Profesor' },
    { id: 'section_head', name: 'Jefe de Sección' },
    { id: 'program', name: 'Programa' }
  ];

  // Opciones para tipos de empleo (para profesores)
  employmentTypes = [
    { id: 1, name: 'Tiempo Completo' },
    { id: 2, name: 'Medio Tiempo' },
    { id: 3, name: 'Cátedra' }
  ];

  // Opciones para tipos de documento
  documentTypes = [
    { id: '1', name: 'Cédula de Ciudadanía' },
    { id: '2', name: 'Cédula de Extranjería' },
    { id: '3', name: 'Pasaporte' }
  ];

  // Control de visibilidad de secciones
  selectedRole: string = '';
  showPersonalData: boolean = false;
  showPasswordSection: boolean = false;
  showRoleAssignment: boolean = false;

  // Getter para obtener el rol actual del formulario
  get currentRole(): string {
    return this.registerForm?.get('role')?.value || '';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly registerService: RegisterService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    // Inicializar solo con el campo de rol
    this.registerForm = this.fb.group({
      role: ['', Validators.required]
    });

    // Escuchar cambios en el rol para mostrar/ocultar secciones
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      console.log('Rol cambiado a:', role); // Debug
      this.selectedRole = role;
      this.updateFormBasedOnRole(role);
    });

    // Reset de visibilidad
    this.resetFormVisibility();
  }

  private resetFormVisibility(): void {
    this.selectedRole = '';
    this.showPersonalData = false;
    this.showPasswordSection = false;
    this.showRoleAssignment = false;
  }

  private updateFormBasedOnRole(role: string): void {
    // Limpiar todos los controles excepto el rol
    const formKeys = Object.keys(this.registerForm.controls);
    formKeys.forEach(key => {
      if (key !== 'role') {
        this.registerForm.removeControl(key);
      }
    });

    // Agregar campos base para todos los roles
    if (role && role !== '') {
      this.addBaseFields(role);
    }

    // Mostrar secciones correspondientes
    this.updateSectionVisibility(role);
  }

  private addBaseFields(role: string): void {
    // Todos los roles necesitan datos personales básicos
    this.registerForm.addControl('name', this.fb.control('', [Validators.required, Validators.minLength(2)]));
    this.registerForm.addControl('lastName', this.fb.control('', [Validators.required, Validators.minLength(2)]));
    this.registerForm.addControl('username', this.fb.control('', [Validators.required, Validators.minLength(3)]));
    this.registerForm.addControl('email', this.fb.control('', [Validators.required, Validators.email]));

    // Agregar contraseña para todos los roles
    this.addPasswordFields();

    // Campos específicos según el rol
    switch (role) {
      case 'admin':
        this.addAdminFields();
        break;
      
      case 'section_head':
        this.registerForm.addControl('sectionName', this.fb.control('', [Validators.required, Validators.minLength(3)]));
        this.addDocumentFields();
        break;
      
      case 'teacher':
        this.addTeacherFields();
        break;
      
      case 'student':
        this.addStudentFields();
        break;
      
      case 'program':
        this.addProgramFields();
        break;
    }
  }

  private addDocumentFields(): void {
    this.registerForm.addControl('documentTypeId', this.fb.control('', Validators.required));
    this.registerForm.addControl('documentNumber', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    this.registerForm.addControl('faculty', this.fb.control('', Validators.required));
  }

  private addPasswordFields(): void {
    this.registerForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(8)]));
    this.registerForm.addControl('confirmPassword', this.fb.control('', Validators.required));
    
    // Agregar validador de coincidencia de contraseñas
    this.registerForm.setValidators(RegistrarTableComponent.passwordMatchValidator);
  }

  private addTeacherFields(): void {
    // Campos básicos de documento
    this.addDocumentFields();
    // Campos específicos para profesores
    this.registerForm.addControl('employmentTypeId', this.fb.control('', Validators.required));
    this.registerForm.addControl('maxHours', this.fb.control('', [Validators.required, Validators.min(1), Validators.max(48)]));
  }

  private addStudentFields(): void {
    // Solo campos básicos de documento para estudiantes
    this.addDocumentFields();
  }

  private addProgramFields(): void {
    // Los programas solo necesitan campos básicos de documento
    this.addDocumentFields();
  }

  private addAdminFields(): void {
    // Solo campos básicos de documento para administradores
    this.addDocumentFields();
  }

  private updateSectionVisibility(role: string): void {
    // Mostrar datos personales para todos los roles
    this.showPersonalData = role !== '';
    
    // Mostrar contraseña para todos los roles
    this.showPasswordSection = role !== '';
    
    // Mostrar asignación de rol para section_head
    this.showRoleAssignment = role === 'section_head';
  }

  static passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;

      const formValue = this.registerForm.value;
      const role = formValue.role;

      switch (role) {
        case 'admin':
          this.registerAdministrator(formValue);
          break;
        case 'student':
          this.registerStudent(formValue);
          break;
        case 'teacher':
          this.registerTeacher(formValue);
          break;
        case 'section_head':
          this.registerSectionHead(formValue);
          break;
        case 'program':
          this.registerProgram(formValue);
          break;
        default:
          this.handleError('Rol no válido seleccionado', null);
      }
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private registerAdministrator(formValue: any): void {
    const adminPayload: UserRegisterRequestDTO = {
      username: formValue.username,
      password: formValue.password,
      faculty: formValue.faculty,
      name: formValue.name,
      lastName: formValue.lastName,
      email: formValue.email,
      documentTypeId: formValue.documentTypeId,
      documentNumber: formValue.documentNumber
    };

    this.registerService.registerAdmin(adminPayload).subscribe({
      next: (userId: number) => {
        this.handleSuccess(`Administrador registrado exitosamente con ID: ${userId}`);
        console.log('Administrador creado con ID:', userId);
      },
      error: (error) => {
        this.handleError('Error al registrar administrador', error);
      }
    });
  }

  private registerStudent(formValue: any): void {
    const studentPayload: UserRegisterRequestDTO = {
      username: formValue.username,
      password: formValue.password,
      faculty: formValue.faculty,
      name: formValue.name,
      lastName: formValue.lastName,
      email: formValue.email,
      documentTypeId: formValue.documentTypeId,
      documentNumber: formValue.documentNumber
    };

    this.registerService.registerStudent(studentPayload).subscribe({
      next: (userId: number) => {
        this.handleSuccess(`Estudiante registrado exitosamente con ID: ${userId}`);
        console.log('Estudiante creado con ID:', userId);
      },
      error: (error) => {
        this.handleError('Error al registrar estudiante', error);
      }
    });
  }

  private registerProgram(formValue: any): void {
    const programPayload: UserRegisterRequestDTO = {
      username: formValue.username,
      password: formValue.password,
      faculty: formValue.faculty,
      name: formValue.name,
      lastName: formValue.lastName,
      email: formValue.email,
      documentTypeId: formValue.documentTypeId,
      documentNumber: formValue.documentNumber
    };

    this.registerService.registerProgram(programPayload).subscribe({
      next: (userId: number) => {
        this.handleSuccess(`Programa registrado exitosamente con ID: ${userId}`);
        console.log('Programa creado con ID:', userId);
      },
      error: (error) => {
        this.handleError('Error al registrar programa', error);
      }
    });
  }

  private registerTeacher(formValue: any): void {
    const teacherPayload: TeacherRegisterRequestDTO = {
      employmentTypeId: Number(formValue.employmentTypeId),
      maxHours: Number(formValue.maxHours),
      user: {
        username: formValue.username,
        password: formValue.password,
        faculty: formValue.faculty,
        name: formValue.name,
        lastName: formValue.lastName,
        email: formValue.email,
        documentTypeId: formValue.documentTypeId,
        documentNumber: formValue.documentNumber
      }
    };

    this.registerService.registerTeacher(teacherPayload).subscribe({
      next: (response: TeacherResponseDTO) => {
        this.handleSuccess(`Profesor registrado exitosamente con ID: ${response.id}`);
        console.log('Profesor creado:', response);
      },
      error: (error) => {
        this.handleError('Error al registrar profesor', error);
      }
    });
  }

  private registerSectionHead(formValue: any): void {
    const sectionPayload: SectionRegisterRequestDTO = {
      name: formValue.sectionName,
      user: {
        username: formValue.username,
        password: formValue.password,
        faculty: formValue.faculty,
        name: formValue.name,
        lastName: formValue.lastName,
        email: formValue.email,
        documentTypeId: formValue.documentTypeId,
        documentNumber: formValue.documentNumber
      }
    };

    this.registerService.registerSectionHead(sectionPayload).subscribe({
      next: (response: SectionResponseDTO) => {
        this.handleSuccess(`Jefe de sección registrado exitosamente. Sección "${response.name}" creada con ID: ${response.id}`);
        console.log('Jefe de sección y sección creados:', response);
      },
      error: (error) => {
        this.handleError('Error al registrar jefe de sección', error);
      }
    });
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.registrationResult = {
      success: true,
      message: message,
      details: 'El usuario ha sido creado exitosamente en el sistema.'
    };
    this.showConfirmationPopup = true;
    
    // Limpiar formulario
    this.registerForm.reset();
    this.initializeForm();
  }

  private handleError(message: string, error: any): void {
    this.isLoading = false;
    console.error(message, error);
    
    let errorMsg = message;
    let details = 'Por favor, revise los datos e intente nuevamente.';
    
    if (error?.error?.message) {
      details = error.error.message;
    } else if (error?.message) {
      details = error.message;
    }
    
    this.registrationResult = {
      success: false,
      message: errorMsg,
      details: details
    };
    this.showConfirmationPopup = true;
  }

  // Métodos para manejar el popup
  onCloseConfirmation(): void {
    this.showConfirmationPopup = false;
    this.registrationResult = null;
  }

  onRetryRegistration(): void {
    this.showConfirmationPopup = false;
    this.registrationResult = null;
    // El formulario mantiene los datos para que el usuario pueda corregir y reintentar
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  // Método para verificar si existe un control
  hasControl(controlName: string): boolean {
    return this.registerForm?.get(controlName) !== null;
  }

  // Getters para facilitar la validación en el template
  get name() { return this.registerForm.get('name'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }
  get sectionName() { return this.registerForm.get('sectionName'); }
  get documentTypeId() { return this.registerForm.get('documentTypeId'); }
  get documentNumber() { return this.registerForm.get('documentNumber'); }
  get faculty() { return this.registerForm.get('faculty'); }
  get employmentTypeId() { return this.registerForm.get('employmentTypeId'); }
  get maxHours() { return this.registerForm.get('maxHours'); }

  // Validadores de campo
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Formato de correo electrónico inválido';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      lastName: 'Apellido',
      username: 'Nombre de usuario',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmación de contraseña',
      role: 'Rol',
      sectionName: 'Nombre de la sección',
      documentTypeId: 'Tipo de documento',
      documentNumber: 'Número de documento',
      faculty: 'Facultad',
      employmentTypeId: 'Tipo de vinculación',
      maxHours: 'Horas máximas'
    };
    return labels[fieldName] || fieldName;
  }

  get hasPasswordMismatch(): boolean {
    return !!(this.registerForm.errors?.['passwordMismatch'] && 
             this.confirmPassword?.touched);
  }

  get isSubmitDisabled(): boolean {
    return this.registerForm.invalid || this.isLoading;
  }
}
