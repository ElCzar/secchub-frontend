import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    FormsModule,
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
  isFormReady = false;
  
  // Datos de los componentes hijos
  personalData: any = {};
  passwordData: any = {};
  roleSpecificData: any = {};
  
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
    // Crear formulario solo con el campo de rol
    this.registerForm = this.fb.group({
      role: ['', Validators.required]
    });

    // Escuchar cambios en el rol
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      if (role !== this.selectedRole) {
        this.selectedRole = role;
        this.resetComponentData(); // Limpiar datos cuando cambie el rol
      }
    });

    // Marcar el formulario como listo
    this.isFormReady = true;
  }

  private resetComponentData(): void {
    this.personalData = {};
    this.passwordData = {};
    this.roleSpecificData = {};
  }

  // Métodos para recibir datos de componentes hijos
  onPersonalDataChange(data: any): void {
    this.personalData = { ...data };
  }

  onPasswordDataChange(data: any): void {
    this.passwordData = { ...data };
  }

  onRoleSpecificDataChange(data: any): void {
    this.roleSpecificData = { ...data };
  }

  onPasswordChange(): void {
    // Los datos de contraseña se actualizan automáticamente por ngModel
  }

  private validateAllData(): { isValid: boolean, missingFields: string[] } {
    const missingFields: string[] = [];

    // Validar datos personales
    if (!this.personalData.name || this.personalData.name.trim() === '') {
      missingFields.push('Nombre');
    }
    if (!this.personalData.lastName || this.personalData.lastName.trim() === '') {
      missingFields.push('Apellido');
    }
    if (!this.personalData.username || this.personalData.username.trim() === '') {
      missingFields.push('Nombre de usuario');
    }
    if (!this.personalData.email || this.personalData.email.trim() === '') {
      missingFields.push('Correo electrónico');
    }
    if (!this.personalData.documentTypeId) {
      missingFields.push('Tipo de documento');
    }
    if (!this.personalData.documentNumber || this.personalData.documentNumber.trim() === '') {
      missingFields.push('Número de documento');
    }
    if (!this.personalData.faculty || this.personalData.faculty.trim() === '') {
      missingFields.push('Facultad');
    }

    // Validar contraseñas
    if (!this.passwordData.password || this.passwordData.password.length < 8) {
      missingFields.push('Contraseña (mínimo 8 caracteres)');
    }
    if (this.passwordData.password !== this.passwordData.confirmPassword) {
      missingFields.push('Las contraseñas no coinciden');
    }

    // Validar datos específicos por rol
    switch (this.selectedRole) {
      case 'teacher':
        if (!this.roleSpecificData.employmentTypeId) {
          missingFields.push('Tipo de vinculación');
        }
        if (!this.roleSpecificData.maxHours) {
          missingFields.push('Máximo de horas');
        }
        break;
      case 'section_head':
        if (!this.roleSpecificData.sectionName || this.roleSpecificData.sectionName.trim() === '') {
          missingFields.push('Nombre de sección');
        }
        break;
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  private combineAllData(): any {
    return {
      role: this.selectedRole,
      ...this.personalData,
      ...this.passwordData,
      ...this.roleSpecificData
    };
  }

  private resetFormVisibility(): void {
    this.selectedRole = '';
    this.showPersonalData = false;
    this.showPasswordSection = false;
    this.showRoleAssignment = false;
  }

  private updateValidatorsBasedOnRole(role: string): void {
    // Limpiar todos los validadores primero
    this.clearAllValidators();
    
    // Establecer validadores según el rol
    if (role && role !== '') {
      this.setValidatorsForRole(role);
    }

    // Mostrar secciones correspondientes
    this.updateSectionVisibility(role);
  }

  private clearAllValidators(): void {
    // Limpiar validadores de todos los campos excepto rol
    const fieldsToReset = ['name', 'lastName', 'username', 'email', 'password', 'confirmPassword',
                          'documentTypeId', 'documentNumber', 'faculty', 'employmentTypeId', 
                          'maxHours', 'sectionName', 'programName'];
    
    fieldsToReset.forEach(field => {
      const control = this.registerForm.get(field);
      if (control) {
        control.clearValidators();
        control.setValue('');
        control.markAsUntouched();
        // No llamar updateValueAndValidity aquí para evitar bucles
      }
    });
  }

  private setValidatorsForRole(role: string): void {
    // Campos básicos para todos los roles
    const nameCtrl = this.registerForm.get('name');
    const lastNameCtrl = this.registerForm.get('lastName');
    const usernameCtrl = this.registerForm.get('username');
    const emailCtrl = this.registerForm.get('email');
    const passwordCtrl = this.registerForm.get('password');
    const confirmPasswordCtrl = this.registerForm.get('confirmPassword');
    
    if (nameCtrl) nameCtrl.setValidators([Validators.required, Validators.minLength(2)]);
    if (lastNameCtrl) lastNameCtrl.setValidators([Validators.required, Validators.minLength(2)]);
    if (usernameCtrl) usernameCtrl.setValidators([Validators.required, Validators.minLength(3)]);
    if (emailCtrl) emailCtrl.setValidators([Validators.required, Validators.email]);
    if (passwordCtrl) passwordCtrl.setValidators([Validators.required, Validators.minLength(8)]);
    if (confirmPasswordCtrl) confirmPasswordCtrl.setValidators([Validators.required]);

    // Validadores específicos según el rol
    switch (role) {
      case 'admin':
        this.setAdminValidators();
        break;
      case 'section_head':
        this.setSectionHeadValidators();
        break;
      case 'teacher':
        this.setTeacherValidators();
        break;
      case 'student':
        this.setStudentValidators();
        break;
      case 'program':
        this.setProgramValidators();
        break;
    }

    // Los validadores se actualizan automáticamente al establecerse
  }

  private setAdminValidators(): void {
    this.setDocumentValidators();
  }

  private setSectionHeadValidators(): void {
    this.setDocumentValidators();
    const sectionNameCtrl = this.registerForm.get('sectionName');
    if (sectionNameCtrl) sectionNameCtrl.setValidators([Validators.required, Validators.minLength(3)]);
  }

  private setTeacherValidators(): void {
    this.setDocumentValidators();
    const employmentTypeCtrl = this.registerForm.get('employmentTypeId');
    const maxHoursCtrl = this.registerForm.get('maxHours');
    
    if (employmentTypeCtrl) employmentTypeCtrl.setValidators([Validators.required]);
    if (maxHoursCtrl) maxHoursCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(48)]);
  }

  private setStudentValidators(): void {
    this.setDocumentValidators();
  }

  private setProgramValidators(): void {
    this.setDocumentValidators();
  }

  private setDocumentValidators(): void {
    const docTypeCtrl = this.registerForm.get('documentTypeId');
    const docNumberCtrl = this.registerForm.get('documentNumber');
    const facultyCtrl = this.registerForm.get('faculty');
    
    if (docTypeCtrl) docTypeCtrl.setValidators([Validators.required]);
    if (docNumberCtrl) docNumberCtrl.setValidators([Validators.required, Validators.minLength(6)]);
    if (facultyCtrl) facultyCtrl.setValidators([Validators.required]);
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
    if (this.isLoading) {
      return;
    }

    // Validar que se haya seleccionado un rol
    if (!this.selectedRole) {
      alert('Por favor seleccione un rol de usuario');
      return;
    }

    // Validar datos de componentes hijos
    const validationResult = this.validateAllData();
    if (!validationResult.isValid) {
      alert(`Por favor complete los siguientes campos:\n• ${validationResult.missingFields.join('\n• ')}`);
      return;
    }

    // Combinar todos los datos
    const completeData = this.combineAllData();

    // Proceder con el registro
    this.isLoading = true;

    switch (this.selectedRole) {
      case 'admin':
        this.registerAdministrator(completeData);
        break;
      case 'student':
        this.registerStudent(completeData);
        break;
      case 'teacher':
        this.registerTeacher(completeData);
        break;
      case 'section_head':
        this.registerSectionHead(completeData);
        break;
      case 'program':
        this.registerProgram(completeData);
        break;
      default:
        this.handleError('Rol no válido seleccionado', null);
    }
  }

  private showValidationMessage(): void {
    const missingFields: string[] = [];
    const fieldLabels: { [key: string]: string } = {
      'role': 'Rol de usuario',
      'username': 'Nombre de usuario',
      'firstName': 'Nombre',
      'lastName': 'Apellido',
      'name': 'Nombre', // Agregar mapeo para 'name'
      'email': 'Correo electrónico',
      'password': 'Contraseña',
      'confirmPassword': 'Confirmar contraseña',
      'employmentType': 'Tipo de vinculación',
      'faculty': 'Facultad',
      'program': 'Programa',
      'semester': 'Semestre',
      'sectionName': 'Nombre de sección',
      'programName': 'Nombre del programa',
      'documentTypeId': 'Tipo de documento',
      'documentNumber': 'Número de documento',
      'maxHours': 'Máximo de horas'
    };

    // Revisar todos los controles del formulario
    Object.keys(this.registerForm.controls).forEach(controlName => {
      const control = this.registerForm.get(controlName);
      
      if (control && control.invalid && control.errors) {
        const label = fieldLabels[controlName] || controlName;
        if (control.errors['required']) {
          missingFields.push(label);
        }
      }
    });

    if (missingFields.length > 0) {
      const message = `Por favor complete los siguientes campos requeridos:\n• ${missingFields.join('\n• ')}`;
      alert(message);
    } else {
      alert('Por favor revise que todos los campos estén correctamente completados.');
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
    // Solo deshabilitar el botón cuando está cargando
    return this.isLoading;
  }
}
