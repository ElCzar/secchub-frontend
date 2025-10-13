# PopEliminar Component

Componente de popup reutilizable para confirmar la eliminación de monitores.

## Uso

### Importar el componente
```typescript
import { PopEliminar } from './components/pop-eliminar/pop-eliminar';

@Component({
  // ...
  imports: [PopEliminar]
})
```

### En el template HTML
```html
<app-pop-eliminar 
  [visible]="showDeleteModal"
  [monitorNombre]="monitorSeleccionado.nombre"
  [monitorApellido]="monitorSeleccionado.apellido"
  [message]="'Esta acción no se puede deshacer. El monitor será eliminado permanentemente del sistema.'"
  [confirmText]="'Sí, eliminar'"
  [cancelText]="'Cancelar'"
  (confirm)="onConfirmDelete()"
  (cancelled)="onCancelDelete()">
</app-pop-eliminar>
```

### En el componente TypeScript
```typescript
export class MyComponent {
  showDeleteModal = false;
  monitorSeleccionado: Monitor | null = null;

  // Mostrar modal de confirmación de eliminación
  eliminarMonitor(monitor: Monitor) {
    this.monitorSeleccionado = monitor;
    this.showDeleteModal = true;
  }

  onConfirmDelete() {
    if (this.monitorSeleccionado) {
      this.showDeleteModal = false;
      this.procederEliminacion(this.monitorSeleccionado);
    }
  }

  onCancelDelete() {
    this.showDeleteModal = false;
    this.monitorSeleccionado = null;
  }

  procederEliminacion(monitor: Monitor) {
    // Lógica para eliminar el monitor
    this.monitorService.eliminar(monitor.id).subscribe({
      next: () => {
        // Mostrar éxito
        this.cargarMonitores(); // Recargar lista
      },
      error: (error) => {
        // Manejar error
        console.error('Error al eliminar:', error);
      }
    });
  }
}
```

## Propiedades (Inputs)

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `visible` | boolean | `false` | Controla la visibilidad del modal |
| `title` | string | `'¿Estás seguro de que deseas eliminar al monitor?'` | Título base del modal |
| `monitorNombre` | string | `''` | Nombre del monitor a eliminar |
| `monitorApellido` | string | `''` | Apellido del monitor a eliminar |
| `message` | string | `'Esta acción no se puede deshacer...'` | Mensaje de advertencia |
| `confirmText` | string | `'Sí, eliminar'` | Texto del botón de confirmación |
| `cancelText` | string | `'Cancelar'` | Texto del botón de cancelación |

## Eventos (Outputs)

| Evento | Descripción |
|--------|-------------|
| `confirm` | Se emite cuando el usuario confirma la eliminación |
| `cancelled` | Se emite cuando el usuario cancela la acción |

## Características

### 🎨 **Diseño**
- **Ícono prominente**: 🗑️ con efecto de sombra
- **Color de peligro**: Rojo institucional para indicar acción destructiva
- **Información del monitor**: Muestra nombre completo en recuadro destacado
- **Botones claros**: Confirmación en rojo y cancelar neutral

### 🔒 **Seguridad**
- **Confirmación requerida**: No elimina accidentalmente
- **Información clara**: Muestra exactamente qué se va a eliminar
- **Advertencia**: Indica que la acción es irreversible
- **Escape**: Se puede cancelar con la tecla ESC

### ♿ **Accesibilidad**
- **Roles ARIA**: Para lectores de pantalla
- **Navegación por teclado**: ESC para cancelar
- **Labels descriptivos**: Títulos claros y contextuales
- **Contraste**: Colores que cumplen estándares de accesibilidad

### 📱 **Responsive**
- **Adaptable**: Funciona en desktop, tablet y móvil
- **Máximo ancho**: Se ajusta a pantallas pequeñas
- **Padding dinámico**: Mantiene legibilidad en todos los tamaños

## Personalización

### Mensajes dinámicos
El componente genera automáticamente el título completo:
- **Sin nombre**: "¿Estás seguro de que deseas eliminar al monitor?"
- **Con nombre**: "¿Estás seguro de que deseas eliminar al monitor Juan Pérez?"

### Estilos customizables
```scss
// Cambiar colores del botón de eliminar
.btn--danger {
  background: #custom-red;
  
  &:hover {
    background: #darker-red;
  }
}

// Personalizar ícono
.danger-icon {
  color: #custom-color;
  filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.2));
}
```

## Integración con la tabla de monitores

```typescript
// En monitores-table.ts
eliminarMonitor(monitor: Monitor) {
  // Mostrar popup de confirmación en lugar de confirm() del navegador
  this.showDeleteModal = true;
  this.monitorToDelete = monitor;
}

onConfirmDelete() {
  if (this.monitorToDelete) {
    const index = this.monitores.findIndex(m => m.id === this.monitorToDelete!.id);
    if (index !== -1) {
      this.monitores.splice(index, 1);
      this.update.emit(this.monitores);
    }
  }
  this.showDeleteModal = false;
  this.monitorToDelete = null;
}
```

## Consistencia con el sistema

Este componente sigue los mismos patrones que:
- `PopGuardarCambios`: Para confirmaciones de guardado
- `PopEnviarCambios`: Para confirmaciones de envío
- Mantiene la coherencia visual y de UX del sistema