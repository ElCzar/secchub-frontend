import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { UserRegisterRequestDTO, UserCreatedResponse } from '../../models/user.models';
import { SectionRegisterRequestDTO, SectionResponseDTO } from '../../models/section.models';
import { PopConfimacion } from '../pop-confimacion/pop-confimacion';

export interface RegistrationResult {
  success: boolean;
  message: string;
  details?: string;
}

@Component({
  selector: 'app-registrar-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopConfimacion],
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
    { id: 'section_head', name: 'Jefe de Sección' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly registerService: RegisterService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      // Datos personales simplificados
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      
      // Datos de cuenta simplificados
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      
      // Rol y sección
      role: ['', Validators.required],
      sectionName: [''] // Solo requerido si el rol es jefe de sección
    }, {
      validators: this.passwordMatchValidator
    });

    // Agregar validador condicional para sectionName
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const sectionNameControl = this.registerForm.get('sectionName');
      if (role === 'section_head') {
        sectionNameControl?.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        sectionNameControl?.clearValidators();
      }
      sectionNameControl?.updateValueAndValidity();
    });
  }

  private passwordMatchValidator(form: FormGroup) {
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

      if (role === 'admin') {
        this.registerAdministrator(formValue);
      } else if (role === 'section_head') {
        this.registerSectionHead(formValue);
      }
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private registerAdministrator(formValue: any): void {
    const adminPayload: UserRegisterRequestDTO = {
      username: formValue.email, // Usar email como username
      password: formValue.password,
      faculty: 'N/A', // Campo requerido por el backend pero no por el negocio
      name: formValue.name,
      lastName: formValue.lastName,
      email: formValue.email,
      documentTypeId: '1', // Valor por defecto
      documentNumber: 'N/A' // Campo requerido por el backend pero no por el negocio
    };

    this.registerService.registerAdmin(adminPayload).subscribe({
      next: (response: UserCreatedResponse) => {
        this.handleSuccess('Administrador registrado exitosamente');
        console.log('Administrador creado:', response);
      },
      error: (error) => {
        this.handleError('Error al registrar administrador', error);
      }
    });
  }

  private registerSectionHead(formValue: any): void {
    const sectionPayload: SectionRegisterRequestDTO = {
      name: formValue.sectionName,
      user: {
        username: formValue.email, // Usar email como username
        password: formValue.password,
        faculty: 'N/A', // Campo requerido por el backend pero no por el negocio
        name: formValue.name,
        lastName: formValue.lastName,
        email: formValue.email,
        documentTypeId: '1', // Valor por defecto
        documentNumber: 'N/A' // Campo requerido por el backend pero no por el negocio
      }
    };

    this.registerService.registerSectionHead(sectionPayload).subscribe({
      next: (response: SectionResponseDTO) => {
        this.handleSuccess(`Jefe de sección registrado exitosamente. Sección "${response.name}" creada.`);
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

  // Getters para facilitar la validación en el template
  get name() { return this.registerForm.get('name'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }
  get sectionName() { return this.registerForm.get('sectionName'); }

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
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmación de contraseña',
      role: 'Rol',
      sectionName: 'Nombre de la sección'
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
