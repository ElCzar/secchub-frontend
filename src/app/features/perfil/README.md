# Pop-up Perfil de Usuario

## Descripción

El componente `PopPerfilComponent` es un modal que permite visualizar y editar el perfil de usuario en el sistema. Incluye funcionalidades diferenciadas según el rol del usuario.

## Características

### Funcionalidades Principales

- **Visualización de Perfil**: Muestra información completa del usuario
- **Edición Condicional**: Solo los administradores pueden editar su perfil
- **Roles Dinámicos**: Diferencia entre administradores y jefes de sección
- **Interfaz Responsiva**: Adaptada para dispositivos móviles y desktop
- **Accesibilidad**: Implementa ARIA roles y navegación por teclado

### Información Mostrada

- **Nombre Completo**: Nombre y apellidos del usuario
- **Correo Electrónico**: Dirección de correo institucional
- **Rol**: Administrador o Jefe de Sección (con sección específica)

### Estados del Componente

1. **Vista (Solo Lectura)**: Para jefes de sección
2. **Vista con Edición**: Para administradores
3. **Modo Edición**: Formulario para modificar datos
4. **Estado de Carga**: Mientras se cargan o guardan los datos
5. **Estado de Error**: Cuando hay problemas de conexión

## Instalación y Uso

### 1. Importación del Componente

```typescript
import { PopPerfilComponent } from './features/perfil/components/pop-perfil/pop-perfil';

@Component({
  // ...
  imports: [PopPerfilComponent]
})
export class MiComponente {
  // ...
}
```

### 2. Uso Básico en el Template

```html
<!-- Para mostrar el perfil del usuario actual -->
<app-pop-perfil
  [isVisible]="mostrarPerfil"
  (closeModal)="cerrarPerfil()"
  (profileUpdated)="perfilActualizado($event)">
</app-pop-perfil>

<!-- Para mostrar el perfil de un usuario específico -->
<app-pop-perfil
  [isVisible]="mostrarPerfil"
  [userId]="usuarioSeleccionado"
  (closeModal)="cerrarPerfil()"
  (profileUpdated)="perfilActualizado($event)">
</app-pop-perfil>
```

### 3. Implementación en el Componente

```typescript
export class MiComponente {
  mostrarPerfil = false;
  usuarioSeleccionado?: string;

  // Abrir perfil del usuario actual
  abrirMiPerfil() {
    this.usuarioSeleccionado = undefined;
    this.mostrarPerfil = true;
  }

  // Abrir perfil de otro usuario
  abrirPerfilUsuario(userId: string) {
    this.usuarioSeleccionado = userId;
    this.mostrarPerfil = true;
  }

  // Cerrar el popup
  cerrarPerfil() {
    this.mostrarPerfil = false;
    this.usuarioSeleccionado = undefined;
  }

  // Manejar actualización de perfil
  perfilActualizado(perfil: UserProfile) {
    console.log('Perfil actualizado:', perfil);
    // Actualizar datos en la aplicación
  }
}
```

## API del Componente

### Inputs

| Propiedad | Tipo | Defecto | Descripción |
|-----------|------|---------|-------------|
| `isVisible` | `boolean` | `false` | Controla la visibilidad del modal |
| `userId` | `string` | `undefined` | ID del usuario a mostrar (opcional, si no se proporciona muestra el usuario actual) |

### Outputs

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `closeModal` | `void` | Se emite cuando se cierra el modal |
| `profileUpdated` | `UserProfile` | Se emite cuando se actualiza un perfil correctamente |

## Modelos de Datos

### UserProfile

```typescript
interface UserProfile {
  id: string;
  nombreCompleto: string;
  correo: string;
  rol: 'administrador' | 'jefe_seccion';
  seccion?: string; // Solo para jefe de sección
}
```

### EditUserProfileRequest

```typescript
interface EditUserProfileRequest {
  id: string;
  nombreCompleto: string;
  correo: string;
}
```

## Reglas de Negocio

### Permisos de Edición

- **Administradores**: Pueden editar su propio perfil
- **Jefes de Sección**: Solo pueden visualizar, no editar

### Validaciones

- **Nombre Completo**: Campo requerido, no puede estar vacío
- **Correo Electrónico**: Campo requerido, debe tener formato válido
- **Rol**: Solo lectura, no se puede modificar

## Servicios Utilizados

### ProfileService

El componente utiliza `ProfileService` para:

- `getCurrentUserProfile()`: Obtener perfil del usuario actual
- `getUserProfile(userId)`: Obtener perfil de usuario específico
- `updateUserProfile(data)`: Actualizar datos del perfil
- `canEditProfile(role)`: Verificar permisos de edición

## Estilos y Personalización

### Variables CSS Utilizadas

```scss
--brand-azul: #007bff;        // Color principal
--brand-rojo: #dc3545;        // Color de error
--text-700: #495057;          // Texto principal
--text-600: #6c757d;          // Texto secundario
--text-800: #343a40;          // Texto oscuro
--text-500: #adb5bd;          // Texto claro
```

### Clases CSS Principales

- `.modal-backdrop`: Fondo del modal
- `.modal-content`: Contenedor principal
- `.profile-view`: Modo de visualización
- `.profile-edit`: Modo de edición
- `.avatar-circle`: Avatar del usuario

## Accesibilidad

### Características Implementadas

- **ARIA Roles**: `dialog`, `aria-labelledby`, `aria-modal`
- **Navegación por Teclado**: ESC para cerrar, Tab para navegación
- **Labels Asociados**: Todos los campos tienen labels apropiados
- **Focus Management**: Manejo correcto del foco del teclado
- **Screen Reader**: Textos descriptivos para lectores de pantalla

### Atajos de Teclado

- **ESC**: Cerrar el modal
- **Tab**: Navegar entre elementos
- **Enter/Space**: Activar botones

## Responsive Design

### Breakpoints

- **Desktop** (>768px): Layout completo con avatares grandes
- **Tablet** (576px-768px): Layout adaptado
- **Mobile** (<576px): Layout vertical, botones de ancho completo

### Adaptaciones Móviles

- Avatares más pequeños
- Botones de ancho completo
- Padding reducido
- Font sizes adaptados

## Ejemplo Completo

Ver `PerfilPageComponent` en `src/app/features/perfil/pages/perfil-page/` para un ejemplo completo de implementación.

## Estructura de Archivos

```
src/app/features/perfil/
├── components/
│   └── pop-perfil/
│       ├── pop-perfil.ts          # Lógica del componente
│       ├── pop-perfil.html        # Template HTML
│       ├── pop-perfil.scss        # Estilos
│       └── pop-perfil.spec.ts     # Tests
├── models/
│   └── user-profile.models.ts     # Interfaces TypeScript
├── services/
│   └── profile.service.ts         # Servicio de perfil
└── pages/
    └── perfil-page/               # Página de ejemplo
        ├── perfil-page.ts
        ├── perfil-page.html
        ├── perfil-page.scss
        └── perfil-page.spec.ts
```

## Notas Técnicas

- **Angular Version**: 18+
- **Standalone Component**: ✅
- **TypeScript**: Strict mode compatible
- **SCSS**: Con variables CSS personalizadas
- **Lazy Loading**: Compatible
- **SSR**: Compatible

## Próximas Mejoras

- [ ] Subida de foto de perfil
- [ ] Validación en tiempo real
- [ ] Historial de cambios
- [ ] Integración con autenticación externa
- [ ] Exportar datos de perfil