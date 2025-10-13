# PopEnviarCambios Component

Componente de popup reutilizable para confirmar el envío de cambios al administrador.

## Uso

### Importar el componente
```typescript
import { PopEnviarCambios } from './shared/components/pop-enviar-cambios/pop-enviar-cambios';

@Component({
  // ...
  imports: [PopEnviarCambios]
})
```

### En el template HTML
```html
<app-pop-enviar-cambios 
  [visible]="showSendModal"
  [title]="'¿Seguro deseas enviar cambios al administrador?'"
  [message]="'Una vez enviados, los cambios serán revisados por el administrador.'"
  [cambiosCount]="totalCambios"
  [confirmText]="'Sí, enviar'"
  [cancelText]="'Cancelar'"
  (confirm)="onConfirmSend()"
  (cancelled)="onCancelSend()">
</app-pop-enviar-cambios>
```

### En el componente TypeScript
```typescript
export class MyComponent {
  showSendModal = false;
  totalCambios = 0;

  // Mostrar modal de confirmación
  mostrarConfirmacionEnvio() {
    this.totalCambios = this.contarCambios();
    
    if (this.totalCambios === 0) {
      // Manejar caso sin cambios
      alert('No hay cambios para enviar.');
      return;
    }
    
    this.showSendModal = true;
  }

  onConfirmSend() {
    this.showSendModal = false;
    this.enviarCambiosAlAdministrador();
  }

  onCancelSend() {
    this.showSendModal = false;
  }

  contarCambios() {
    // Lógica para contar cambios pendientes
    return this.datos.filter(item => item.modificado).length;
  }

  async enviarCambiosAlAdministrador() {
    try {
      await this.adminService.enviarCambios(this.datos);
      // Mostrar éxito
    } catch (error) {
      // Manejar error
    }
  }
}
```

## Propiedades (Inputs)

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `visible` | boolean | `false` | Controla la visibilidad del modal |
| `title` | string | `'¿Seguro deseas enviar cambios al administrador?'` | Título del modal |
| `message` | string | `'Una vez enviados, los cambios serán revisados...'` | Mensaje explicativo |
| `confirmText` | string | `'Sí, enviar'` | Texto del botón de confirmación |
| `cancelText` | string | `'Cancelar'` | Texto del botón de cancelación |
| `cambiosCount` | number | `0` | Número de cambios a enviar (se muestra en el mensaje) |

## Eventos (Outputs)

| Evento | Descripción |
|--------|-------------|
| `confirm` | Se emite cuando el usuario confirma el envío |
| `cancelled` | Se emite cuando el usuario cancela la acción |

## Características

- **Modal de confirmación**: Previene envíos accidentales
- **Contador dinámico**: Muestra cuántos cambios se enviarán
- **Mensaje personalizable**: Texto configurable según el contexto
- **Advertencia visual**: Ícono de advertencia para destacar la importancia
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Navegación por teclado y roles ARIA
- **Consistente**: Sigue el sistema de diseño de la aplicación

## Casos de uso comunes

- Confirmar envío de solicitudes de monitores
- Confirmar envío de planificación académica
- Confirmar envío de cambios en programas
- Cualquier acción que requiera confirmación antes de enviar al administrador