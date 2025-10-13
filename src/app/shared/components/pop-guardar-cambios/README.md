# PopGuardarCambios Component

Componente de popup reutilizable para mostrar el resultado de operaciones de guardado.

## Uso

### Importar el componente
```typescript
import { PopGuardarCambios } from './shared/components/pop-guardar-cambios/pop-guardar-cambios';

@Component({
  // ...
  imports: [PopGuardarCambios]
})
```

### En el template HTML
```html
<app-pop-guardar-cambios 
  [visible]="showSaveModal"
  [isSuccess]="saveSuccess"
  [successMessage]="'Los datos se guardaron correctamente'"
  [errorMessage]="'Error al guardar. Verifique los datos e intente nuevamente.'"
  (closed)="onModalClosed()"
  (retry)="onRetryAction()">
</app-pop-guardar-cambios>
```

### En el componente TypeScript
```typescript
export class MyComponent {
  showSaveModal = false;
  saveSuccess = true;

  // Mostrar modal de éxito
  showSuccessModal() {
    this.saveSuccess = true;
    this.showSaveModal = true;
  }

  // Mostrar modal de error
  showErrorModal() {
    this.saveSuccess = false;
    this.showSaveModal = true;
  }

  onModalClosed() {
    this.showSaveModal = false;
  }

  onRetryAction() {
    this.showSaveModal = false;
    // Lógica para reintentar la operación
    this.saveData();
  }

  async saveData() {
    try {
      // Lógica de guardado
      await this.dataService.save(this.data);
      this.showSuccessModal();
    } catch (error) {
      this.showErrorModal();
    }
  }
}
```

## Propiedades (Inputs)

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `visible` | boolean | `false` | Controla la visibilidad del modal |
| `isSuccess` | boolean | `true` | Define si es un mensaje de éxito o error |
| `successMessage` | string | `'Cambios guardados correctamente'` | Mensaje para caso exitoso |
| `errorMessage` | string | `'No se pudieron guardar los cambios. Inténtelo nuevamente.'` | Mensaje para caso de error |
| `okText` | string | `'Aceptar'` | Texto del botón de confirmación |
| `retryText` | string | `'Intentar otra vez'` | Texto del botón de reintento |

## Eventos (Outputs)

| Evento | Descripción |
|--------|-------------|
| `closed` | Se emite cuando el modal se cierra |
| `retry` | Se emite cuando el usuario hace clic en "Intentar otra vez" (solo en caso de error) |

## Características

- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Incluye roles ARIA y navegación por teclado
- **Personalizable**: Mensajes y textos configurables
- **Estados**: Maneja tanto casos de éxito como de error
- **Consistente**: Sigue el sistema de diseño de la aplicación