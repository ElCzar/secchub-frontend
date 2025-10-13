# 📋 Pantalla de Registro de Usuarios

## 🎯 **Funcionalidad Principal**

Pantalla exclusiva para **administradores** que permite registrar nuevos usuarios en el sistema. Solo se pueden registrar dos tipos de usuarios:
- **Administradores**: Usuarios con permisos completos
- **Jefes de Sección**: Profesores encargados de una sección específica

## 🏗️ **Arquitectura Implementada**

### **📁 Estructura de Archivos**
```
src/app/features/registrar/
├── components/
│   └── registrar-table/           # Componente tabla (futuro)
├── models/
│   ├── user.models.ts            # Modelos de usuario
│   └── section.models.ts         # Modelos de sección
├── pages/
│   └── registrar-page/           # Página principal de registro
├── services/
│   └── register.service.ts       # Servicio para API calls
```

### **🔧 Backend Integration**

#### **API Endpoints Implementados:**
- **POST** `/admin/register/admin` - Registrar administrador
- **POST** `/admin/register/section` - Registrar jefe de sección

#### **DTOs Utilizados:**
- `UserRegisterRequestDTO` - Datos del usuario
- `SectionRegisterRequestDTO` - Datos de sección + usuario
- `UserCreatedResponse` - Respuesta de usuario creado
- `SectionResponseDTO` - Respuesta de sección creada

## 🎨 **Interfaz de Usuario**

### **📋 Secciones del Formulario:**

#### **1. Datos Personales**
- ✅ **Nombre** (requerido, mín. 2 caracteres)
- ✅ **Apellido** (requerido, mín. 2 caracteres)
- ✅ **Correo Electrónico** (requerido, formato email)
- ✅ **Tipo de Documento** (Cédula, Cédula Extranjería, Pasaporte)
- ✅ **Número de Documento** (requerido, mín. 6 caracteres)
- ✅ **Facultad** (selección de 10 facultades)

#### **2. Datos de Cuenta**
- ✅ **Nombre de Usuario** (requerido, mín. 4 caracteres)
- ✅ **Contraseña** (requerido, mín. 8 caracteres)
- ✅ **Confirmar Contraseña** (debe coincidir)

#### **3. Rol y Asignación**
- ✅ **Rol** (Administrador o Jefe de Sección)
- ✅ **Nombre de Sección** (solo si es Jefe de Sección)

### **✨ Características de UX/UI:**

#### **Validación en Tiempo Real:**
- ✅ **Validación de campos** al perder foco
- ✅ **Coincidencia de contraseñas** en vivo
- ✅ **Mensajes de error específicos** por campo
- ✅ **Validación condicional** (sección solo si es jefe)

#### **Estados Visuales:**
- ✅ **Loading states** durante registro
- ✅ **Success messages** con detalles
- ✅ **Error messages** con información específica
- ✅ **Disabled states** para prevenir envíos duplicados

#### **Responsive Design:**
- ✅ **Desktop**: Layout en 2 columnas
- ✅ **Tablet**: Adaptación de espacios
- ✅ **Mobile**: Columna única, botones full-width

## 🔐 **Lógica de Negocio**

### **Registro de Administrador:**
```typescript
// Envía directamente UserRegisterRequestDTO
registerAdmin(payload) → UserCreatedResponse
```

### **Registro de Jefe de Sección:**
```typescript
// Envía SectionRegisterRequestDTO (nombre sección + user data)
registerSectionHead(payload) → SectionResponseDTO
// Automáticamente crea la sección y asigna al usuario como jefe
```

## 📱 **Funcionalidades Implementadas**

### **✅ Validación Completa**
- **Campos requeridos** marcados con *
- **Validación de email** con regex
- **Validación de contraseñas** con coincidencia
- **Validación condicional** de sección
- **Prevención de envío** con formulario inválido

### **✅ Gestión de Estados**
- **Loading spinner** durante requests
- **Mensajes de éxito** con auto-hide (5s)
- **Mensajes de error** con auto-hide (8s)
- **Deshabilitación** de botones durante carga

### **✅ Experiencia de Usuario**
- **Placeholder informativos** en campos
- **Labels descriptivos** y consistentes
- **Iconos** para mejorar comprensión
- **Botón de limpiar** formulario
- **Feedback visual** inmediato

## 🎯 **Flujo de Registro**

### **Para Administrador:**
1. **Llenar datos personales** y de cuenta
2. **Seleccionar rol "Administrador"**
3. **Hacer clic en "Registrar Usuario"**
4. **Sistema llama** `POST /admin/register/admin`
5. **Mensaje de éxito** confirma creación

### **Para Jefe de Sección:**
1. **Llenar datos personales** y de cuenta
2. **Seleccionar rol "Jefe de Sección"**
3. **Ingresar nombre de la sección**
4. **Hacer clic en "Registrar Usuario"**
5. **Sistema llama** `POST /admin/register/section`
6. **Se crea sección Y usuario** automáticamente
7. **Mensaje de éxito** confirma ambas creaciones

## 🔄 **Manejo de Errores**

### **Errores del Backend:**
- ✅ **Usuario duplicado** - "Ya existe un usuario con ese email"
- ✅ **Sección duplicada** - "Ya existe una sección con ese nombre"
- ✅ **Datos inválidos** - Mensajes específicos del servidor
- ✅ **Errores de red** - "Error de conexión, intente nuevamente"

### **Errores de Validación:**
- ✅ **Campos requeridos** - "Campo es requerido"
- ✅ **Formato inválido** - "Formato de email inválido"
- ✅ **Longitud mínima** - "Debe tener al menos X caracteres"
- ✅ **Contraseñas diferentes** - "Las contraseñas no coinciden"

## 🚀 **Características Técnicas**

### **Angular Features:**
- ✅ **Standalone Components** (Angular 18+)
- ✅ **Reactive Forms** con validación
- ✅ **HTTP Client** para API calls
- ✅ **RxJS Observables** para asincronía
- ✅ **TypeScript** con tipado fuerte

### **Styling:**
- ✅ **SCSS** con variables CSS
- ✅ **Grid Layout** responsive
- ✅ **CSS Custom Properties** para theming
- ✅ **Animaciones** y transiciones suaves
- ✅ **Mobile-first** responsive design

## 🎉 **Estado de Implementación**

### **✅ Completado:**
- Formulario completo con validación
- Conexión con backend real
- Manejo de errores robusto
- UI/UX responsive y accesible
- Documentación completa

### **🚀 Listo para:**
- Integración con autenticación
- Pruebas con backend real
- Deploy a producción
- Extensión con más roles (futuro)

---
**Fecha de implementación**: 13 de octubre de 2025  
**Estado**: ✅ **Completamente funcional**  
**Backend**: ✅ **Integrado**  
**Frontend**: ✅ **Responsive y validado**