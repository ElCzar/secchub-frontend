import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScheduleRow, Modality } from '../../models/planificacion.models';
import { ClassroomService, ClassroomDTO, ModalityDTO, ClassroomTypeDTO } from '../../services/classroom.service';


function newScheduleRow(): ScheduleRow {
  return {
    day: undefined,
    startTime: '',
    endTime: '',
    disability: false,
    modality: undefined,
    roomType: undefined,
    room: '',
  };
}

@Component({
  selector: 'app-schedules-table-room',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedules-table-room.html',
  styleUrl: './schedules-table-room.scss'
})
export class SchedulesTableRoom implements OnInit, OnChanges {
  @Input() rows: ScheduleRow[] = [];
  @Input() editable: boolean = false; // Nuevo input para controlar si es editable
  @Output() rowsChange = new EventEmitter<ScheduleRow[]>();
  @Output() scheduleDeleted = new EventEmitter<number>(); // Nuevo output para eliminación

  // Backend data arrays with proper typing
  classrooms: ClassroomDTO[] = [];
  modalities: ModalityDTO[] = [];
  classroomTypes: ClassroomTypeDTO[] = [];

  // Datos para compatibilidad con el template existente
  days = [
    { v: 'LUN', t: 'Lunes' }, { v: 'MAR', t: 'Martes' }, { v: 'MIE', t: 'Miércoles' },
    { v: 'JUE', t: 'Jueves' }, { v: 'VIE', t: 'Viernes' }, { v: 'SAB', t: 'Sábado' }, { v: 'DOM', t: 'Domingo' },
  ] as const;

  // Estos se cargarán únicamente desde el backend
  roomTypes: ('Lecture' | 'Lab' | 'Auditorium')[] = [];
  modalities_local: Modality[] = [];
  
  // Mapas para nombres de visualización
  modalityDisplayNames: Record<string, string> = {};
  roomTypeDisplayNames: Record<string, string> = {};

  constructor(private classroomService: ClassroomService) {
    // Inicialización de valores por defecto para evitar errores si la API falla
    this.modalities_local = ['In-Person', 'Online', 'Hybrid'];
  }

  ngOnInit() {
    this.loadBackendData();
    this.ensureEditableRow();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rows'] && changes['rows'].currentValue) {
      // Solo validar si ya tenemos los datos del backend cargados
      if (this.modalities_local.length > 0 && this.roomTypes.length > 0) {
        this.validateRowsCompatibility(changes['rows'].currentValue);
      }
    }
    
    if (changes['editable'] || changes['rows']) {
      this.ensureEditableRow();
    }
  }

  /**
   * Validar rows solo si tenemos todos los datos necesarios cargados
   */
  private validateRowsIfReady() {
    if (this.rows.length > 0 && this.modalities_local.length > 0 && this.roomTypes.length > 0) {
      this.validateRowsCompatibility(this.rows);
    }
  }

  /**
   * Validar que los valores de los rows sean compatibles con las opciones disponibles
   * y corregir inconsistencias automáticamente
   */
  private validateRowsCompatibility(rows: ScheduleRow[]) {
    const correctedRows: ScheduleRow[] = [];
    let hasChanges = false;
    
    rows.forEach((row: ScheduleRow, index: number) => {
      const originalRow = { ...row };
      
      // Solo aplicar validaciones si se trata de un horario que tiene al menos día Y hora
      // para evitar validaciones prematuras mientras se está llenando el formulario
      const isCompleteEnoughForValidation = row.day && row.startTime && row.endTime;
      
      if (!isCompleteEnoughForValidation) {
        // Si la fila está incompleta, simplemente pasarla sin validar
        console.log(`📝 Row ${index} - Saltando validación por fila incompleta:`, {
          day: row.day,
          startTime: row.startTime,
          endTime: row.endTime
        });
        correctedRows.push(row);
        return;
      }
      
      console.log(`📝 Row ${index} - Validando compatibilidad:`, {
        day: row.day,
        modality: row.modality,
        roomType: row.roomType,
        room: row.room,
        disability: row.disability
      });

      // Verificar modalidad
      if (row.modality) {
        // Verificar si la modalidad es compatible con nuestro modelo interno
        if (!this.modalities_local.includes(row.modality)) {
          console.warn(`⚠️ Row ${index}: Modalidad '${row.modality}' no está en modalities_local:`, this.modalities_local);
          
          // Intentar mapear modalidad
          if (this.modalities_local.length > 0) {
            // Obtener un string para comparación case-insensitive
            const modalityStr = String(row.modality).toLowerCase();
            let mappedModality: Modality | null = null;
            
            // Mapeo aproximado basado en nombres
            if (modalityStr.includes('presencial') || modalityStr.includes('person')) {
              mappedModality = 'In-Person';
            } else if (modalityStr.includes('virtual') || modalityStr.includes('online')) {
              mappedModality = 'Online';
            } else if (modalityStr.includes('hibrido') || modalityStr.includes('híbrido') || modalityStr.includes('hybrid')) {
              mappedModality = 'Hybrid';
            } else {
              // Si no se puede mapear, usar la primera modalidad disponible
              mappedModality = this.modalities_local[0];
            }
            
            // Guardar el nombre original para mostrar en la UI
            this.modalityDisplayNames[mappedModality] = String(row.modality);
            
            // Actualizar a la modalidad mapeada
            row.modality = mappedModality;
            console.log(`✅ Row ${index}: Modalidad corregida a '${row.modality}'`);
            hasChanges = true;
          }
        }
      }

      // Verificar tipo de aula (solo si hay modalidad y no es Online)
      if (row.modality && row.modality !== 'Online') {
        if (row.roomType && !this.roomTypes.includes(row.roomType)) {
          console.warn(`⚠️ Row ${index}: Tipo de aula '${row.roomType}' no está en roomTypes:`, this.roomTypes);
          console.log(`⚠️ Row ${index}: Limpiando tipo de aula inválido '${row.roomType}'`);
          
          // NO asignar automáticamente - dejar que el usuario seleccione
          row.roomType = undefined;
          hasChanges = true;
        }
      } else if (row.modality === 'Online' && row.roomType) {
        // Si es modalidad Online, no debería tener tipo de aula
        row.roomType = undefined;
        hasChanges = true;
      }

      // Verificar aula
      if (row.room && row.room.trim() !== '' && this.classrooms.length > 0) {
        let classroom = this.classrooms.find(classroom => classroom.name === row.room);
        
        // Si no se encuentra por nombre completo, buscar por nombre simple (sin información adicional)
        if (!classroom) {
          // Extraer el nombre simple del aula removiendo información adicional como "(Building A)"
          const simpleName = row.room.split('(')[0].trim();
          classroom = this.classrooms.find(classroom => classroom.name === simpleName);
          
          if (classroom) {
            console.log(`✅ Row ${index}: Aula encontrada por nombre simple '${simpleName}' para '${row.room}'`);
            // Mantener el nombre enriquecido pero asignar el ID correcto
            row.classroomId = classroom.id;
          }
        }
        
        if (!classroom) {
          console.warn(`⚠️ Row ${index}: Aula '${row.room}' no está en classrooms:`, this.classrooms.map(c => c.name));
          
          // Si la modalidad es In-Person o Hybrid, mantener vacío el campo room y classroomId
          if (row.modality === 'In-Person' || row.modality === 'Hybrid') {
            row.room = '';
            row.classroomId = undefined;
            console.log(`✅ Row ${index}: Aula no encontrada, campo limpiado`);
            hasChanges = true;
          }
        } else if (row.classroomId !== classroom.id) {
          // Asignar el ID correcto si no coincide
          row.classroomId = classroom.id;
          console.log(`✅ Row ${index}: ID de aula actualizado a ${classroom.id}`);
          hasChanges = true;
        }
      }
      
      // Verificar coherencia entre modalidad y aula
      if (row.modality === 'Online' && row.room && row.room.trim() !== '') {
        row.room = '';
        row.classroomId = undefined;
        console.log(`✅ Row ${index}: Aula limpiada para modalidad Online`);
        hasChanges = true;
      }
      
      // NO asignar tipo de aula automáticamente - dejar que el usuario seleccione
      // Eliminado: asignación automática de roomType
      
      correctedRows.push(row);
    });
    
    // Si hubo correcciones, actualizar y notificar
    if (hasChanges) {
      console.log('⚠️ Se realizaron correcciones automáticas en los horarios');
      this.rows = correctedRows;
      this.rowsChange.emit([...this.rows]);
    }
  }

  /**
   * Cargar datos desde el backend
   */
  private loadBackendData() {
    console.log('🔄 schedules-table-room: Cargando datos desde ClassroomService...');
    console.log('=== DIAGNÓSTICO DE DATOS ===');
    
    // Cargar aulas
    this.classroomService.getAllClassrooms().subscribe({
      next: (classrooms: ClassroomDTO[]) => {
        if (!classrooms || !Array.isArray(classrooms)) {
          console.error('❌ Formato de respuesta inválido para aulas:', classrooms);
          this.classrooms = [];
          return;
        }
        
        this.classrooms = classrooms;
        console.log('🏢 Aulas cargadas desde backend:', classrooms);
        // Validar rows una vez que tengamos los datos de aulas
        this.validateRowsIfReady();
      },
      error: (error: any) => {
        console.error('❌ Error al cargar aulas:', error);
        this.classrooms = [];
        alert('Error al cargar aulas: ' + (error.message || 'Error de conexión con el servidor'));
      }
    });

    // Cargar tipos de aula
    this.classroomService.getAllClassroomTypes().subscribe({
      next: (types: ClassroomTypeDTO[]) => {
        if (!types || !Array.isArray(types)) {
          console.error('❌ Formato de respuesta inválido para tipos de aula:', types);
          this.roomTypes = [];
          this.classroomTypes = [];
          return;
        }
        
        this.classroomTypes = types;
        
        // Filtrar solo tipos válidos para el modelo
        const validRoomTypes: ('Lecture' | 'Lab' | 'Auditorium')[] = [];
        types.forEach((type: ClassroomTypeDTO) => {
          // Mapear el tipo de aula del backend al tipo estandarizado del frontend
          const mappedType = this.getRoomTypeValue(type);
          if (mappedType) {
            validRoomTypes.push(mappedType);
            console.log(`✅ Tipo de aula '${type.name}' mapeado a '${mappedType}'`);
          } else {
            console.warn(`⚠️ Tipo de aula '${type.name}' no se pudo mapear a un valor válido`);
          }
        });
        
        this.roomTypes = validRoomTypes as ('Lecture' | 'Lab' | 'Auditorium')[];
        
        // Crear un mapa de visualización para los tipos de aula
        this.roomTypeDisplayNames = {
          'Lecture': 'Aula Regular',
          'Lab': 'Laboratorio',
          'Auditorium': 'Auditorio'
        };
        
        // Actualizar con valores reales del backend
        types.forEach((type: ClassroomTypeDTO) => {
          const mappedType = this.getRoomTypeValue(type);
          if (mappedType) {
            this.roomTypeDisplayNames[mappedType] = type.name;
          }
        });
        
        console.log('🏷️ Tipos de aula cargados desde backend:', types);
        console.log('🏷️ roomTypes actualizados:', this.roomTypes);
        console.log('🏷️ roomTypeDisplayNames:', this.roomTypeDisplayNames);
        
        // Validar rows una vez que tengamos todos los datos cargados
        this.validateRowsIfReady();
      },
      error: (error: any) => {
        console.error('❌ Error al cargar tipos de aula:', error);
        this.roomTypes = [];
        this.classroomTypes = [];
        alert('Error al cargar tipos de aula: ' + (error.message || 'Error de conexión con el servidor'));
      }
    });

    // Cargar modalidades
    this.classroomService.getAllModalities().subscribe({
      next: (modalities: ModalityDTO[]) => {
        if (!modalities || !Array.isArray(modalities)) {
          console.error('❌ Formato de respuesta inválido para modalidades:', modalities);
          this.modalities = [];
          this.modalities_local = [];
          return;
        }
        
        this.modalities = modalities;
        
        // Mantener las modalidades originales del backend cuando sea posible
        // pero garantizar compatibilidad con el modelo frontend
        const validModalities: Modality[] = [];
        const modalityMapping: Record<string, Modality> = {
          'Presencial': 'In-Person',
          'Virtual': 'Online',
          'Híbrido': 'Hybrid',
          'Hibrido': 'Hybrid',
          'In-Person': 'In-Person',
          'Online': 'Online',
          'Hybrid': 'Hybrid'
        };
        
        console.log('🎯 Modalidades recibidas del backend:', modalities.map(m => m.name));
        
        modalities.forEach((m: ModalityDTO) => {
          const mappedModality = modalityMapping[m.name];
          
          if (mappedModality) {
            // Guardar la modalidad original en el objeto para mostrarla en la UI
            (m as any).originalName = m.name;
            validModalities.push(mappedModality);
            console.log(`✅ Modalidad '${m.name}' mapeada a '${mappedModality}'`);
          } else {
            console.warn(`⚠️ Modalidad '${m.name}' no se pudo mapear a un valor válido`);
          }
        });
        
        this.modalities_local = validModalities;
        
        // Si no hay modalidades válidas y es necesario, agregar las modalidades por defecto
        if (this.modalities_local.length === 0) {
          console.warn('⚠️ No se cargaron modalidades válidas, usando valores por defecto');
          this.modalities_local = ['In-Person', 'Online', 'Hybrid'];
        }
        
        // Crear un mapa de visualización para las modalidades
        this.modalityDisplayNames = {
          'In-Person': 'Presencial',
          'Online': 'Virtual',
          'Hybrid': 'Híbrido'
        };
        
        // Actualizar con valores reales del backend
        modalities.forEach((m: ModalityDTO) => {
          const mappedModality = modalityMapping[m.name];
          if (mappedModality) {
            this.modalityDisplayNames[mappedModality] = m.name;
            console.log(`✅ Mapeando modalidad ${mappedModality} al nombre ${m.name}`);
          }
        });
        
        console.log('🎯 Modalidades cargadas desde backend:', modalities);
        console.log('🎯 modalities_local actualizados:', this.modalities_local);
        
        // Validar rows una vez que tengamos todos los datos cargados
        this.validateRowsIfReady();
      },
      error: (error: any) => {
        console.error('❌ Error al cargar modalidades:', error);
        this.modalities_local = ['In-Person', 'Online', 'Hybrid']; // Valores por defecto en caso de error
        alert('Error al cargar modalidades: ' + (error.message || 'Error de conexión con el servidor'));
      }
    });
  }

  private ensureEditableRow() {
    // Solo agregar fila editable si está en modo edición y no hay filas
    if (this.editable && this.rows.length === 0) {
      this.addNewEditableRow();
    }
  }

  private addNewEditableRow() {
    console.log('🔧 addNewEditableRow llamado');
    console.log('📊 Estado actual:', { editable: this.editable, rowCount: this.rows.length });
    
    const newRow = newScheduleRow();
    console.log('🆕 Creando nueva fila:', newRow);
    
    this.rows = [...this.rows, newRow];
    console.log('📋 Filas después de agregar:', this.rows);
    console.log('📤 Emitiendo rowsChange desde addNewEditableRow...');
    this.rowsChange.emit(this.rows);
    console.log('✅ addNewEditableRow completado');
  }

  add(): void { 
    console.log('🔥 === BOTÓN + PRESIONADO ===');
    console.log('� Estado del componente:', {
      editable: this.editable,
      rowsLength: this.rows.length,
      rows: this.rows
    });
    
    if (!this.editable) {
      console.log('❌ BLOQUEADO: Componente no es editable');
      console.log('� Verifique que la fila esté en modo edición (_editing = true)');
      return;
    }
    
    console.log('✅ Componente es editable, continuando...');
    
    console.log('🔍 Verificando filas vacías existentes...');
    // Verificar si ya existe una fila realmente vacía (solo campos esenciales)
    // Una fila se considera "vacía" si NO tiene día, hora inicio Y hora fin
    const emptyRows = this.rows.map((row, index) => {
      const isEmpty = !row.day && !row.startTime && !row.endTime;
      console.log(`   Fila ${index}:`, { row, isEmpty });
      return { index, isEmpty, row };
    });
    
    const hasEmptyRow = emptyRows.some(r => r.isEmpty);
    
    if (hasEmptyRow) {
      return;
    }
    
    const newRow = newScheduleRow();
    
    const oldRowsLength = this.rows.length;
    this.rows = [...this.rows, newRow];
    
    this.rowsChange.emit(this.rows);
  }

  /**
   * Método simplificado para agregar nuevos horarios
   * Versión más directa sin validaciones complejas
   */
  addNewSchedule(): void {
    
    // Verificación básica de estado editable
    if (!this.editable) {
      return;
    }

    // Verificar si ya hay filas completamente vacías
    const emptyRows = this.rows.filter(row => 
      !row.day && !row.startTime && !row.endTime && !row.modality
    );
    
    if (emptyRows.length > 0) return;

    // Crear nueva fila directamente
    const newRow = newScheduleRow();

    // Agregar la nueva fila al array
    const previousLength = this.rows.length;
    this.rows = [...this.rows, newRow]; // Usar spread operator para inmutabilidad

    // Notificar al componente padre
    this.rowsChange.emit([...this.rows]); // Crear nueva referencia
  }

  // debugAddSchedule(): removed (only used for temporary debugging)
  
  remove(i: number): void { 
    if (!this.editable) return;
    
  const rowToRemove = this.rows[i];
    
    // Si tiene ID (es un horario guardado), notificar al padre para que maneje la eliminación
    if (rowToRemove.id) {
      this.scheduleDeleted.emit(rowToRemove.id);
    }
    
    // Eliminar la fila del array local
    this.rows = this.rows.filter((_, idx) => idx !== i); 
    this.rowsChange.emit(this.rows);
    
    // Si eliminamos la única fila, agregar automáticamente una nueva
    if (this.rows.length === 0) {
      this.addNewEditableRow();
    }
  }
  
  /**
   * Actualiza un campo específico de una fila y emite el evento de cambio
   * Realiza validaciones para garantizar consistencia de los datos
   */
  patch(i: number, data: Partial<ScheduleRow>) {
    // Validar que el índice sea válido
    if (i < 0 || i >= this.rows.length) {
      return;
    }
    
    // Validación de datos antes de aplicar cambios
    const validatedData: Partial<ScheduleRow> = {};
    
    // Validar modalidad
    if (data.modality !== undefined) {
      if (this.modalities_local.includes(data.modality)) {
        validatedData.modality = data.modality;
      } else {
        console.warn(`⚠️ Modalidad inválida: ${data.modality}`);
        // Usar modalidad presencial por defecto si es inválida
        validatedData.modality = 'In-Person';
      }
    }
    
    // Validar roomType
    if (data.roomType !== undefined) {
      if (data.roomType === undefined || this.roomTypes.includes(data.roomType)) {
        validatedData.roomType = data.roomType;
      } else {
        console.warn(`⚠️ Tipo de aula inválido: ${data.roomType}`);
        validatedData.roomType = undefined;
      }
    }
    
    // Validar room y classroomId
    if (data.room !== undefined) {
      validatedData.room = data.room;
      
      // Si hay un aula, verificar que tenga ID
      if (data.room && data.classroomId === undefined) {
        const classroom = this.classrooms.find(c => c.name === data.room);
        if (classroom) {
          validatedData.classroomId = classroom.id;
        } else {
          // No se encontró el aula en la lista
          validatedData.classroomId = undefined;
        }
      } else {
        validatedData.classroomId = data.classroomId;
      }
    }
    
    // Copiar el resto de campos sin validación específica
    if (data.day !== undefined) {
      validatedData.day = data.day;
      console.log('🗓️ Día actualizado a:', data.day);
    }
    if (data.startTime !== undefined) {
      validatedData.startTime = data.startTime;
      console.log('⏰ Hora inicio actualizada a:', data.startTime);
    }
    if (data.endTime !== undefined) {
      validatedData.endTime = data.endTime;
      console.log('⏰ Hora fin actualizada a:', data.endTime);
    }
    if (data.disability !== undefined) {
      validatedData.disability = data.disability;
      console.log('♿ Discapacidad actualizada a:', data.disability);
    }
    
    console.log('🔄 PASO 1: Aplicando cambios a la fila...');
    // Actualizar directamente el objeto sin reasignar el array para evitar pérdida de foco
    Object.assign(this.rows[i], validatedData);
    console.log('✅ PASO 1 COMPLETADO: Cambios aplicados');
    
    // DEBUG: Mostrar estado final de la fila después de actualizar
    console.log('📊 Estado DESPUÉS de patch:', {
      index: i,
      row: this.rows[i],
      validatedData: validatedData,
      allRows: this.rows
    });
    
    console.log('🔄 PASO 2: Verificaciones post-actualización...');
    // Verificar si classroomId se asignó correctamente
    if (validatedData.room && validatedData.classroomId !== undefined) {
      console.log('✅ classroomId asignado correctamente:', validatedData.classroomId);
    } else if (validatedData.room && validatedData.classroomId === undefined) {
      console.warn('⚠️ Se asignó una sala pero falta classroomId');
    }
    console.log('✅ PASO 2 COMPLETADO: Verificaciones finalizadas');
    
    console.log('🔄 PASO 3: Preparando emisión de eventos...');
    // IMPORTANTE: Crear una nueva referencia del array para que Angular detecte el cambio
    // pero preservar las referencias internas de los objetos para evitar re-renders
    const newRows = [...this.rows];
    console.log('✅ PASO 3 COMPLETADO: Array preparado para emisión');
    
    console.log('📡 PASO 4: Emitiendo rowsChange con', newRows.length, 'filas');
    console.log('🎯 CRÍTICO: Verificar que la fila', i, 'no desaparezca en el procesamiento padre');
    
    console.log('🚀 EJECUTANDO EMIT...');
    // Emitir el cambio
    this.rowsChange.emit(newRows);
    console.log('✅ schedules-table-room: rowsChange emitido exitosamente');
    console.log('🎉 PATCH COMPLETADO EXITOSAMENTE');
  }

  /**
   * Maneja el cambio de salón, incluyendo la asignación del classroomId
   */
  /**
   * Obtiene el nombre simple del aula (sin información adicional) para usar en el select
   */
  getSimpleRoomName(enrichedRoomName: string | undefined): string {
    if (!enrichedRoomName) return '';
    
    // Si el nombre contiene información adicional entre paréntesis, extraer solo el nombre simple
    const simpleName = enrichedRoomName.split('(')[0].trim();
    
    // Verificar que existe una aula con ese nombre simple
    const exists = this.classrooms.find(classroom => classroom.name === simpleName);
    return exists ? simpleName : '';
  }

  onRoomChange(rowIndex: number, selectedRoomName: string): void {
    console.log('onRoomChange llamado:', { 
      rowIndex, 
      selectedRoomName,
      allClassrooms: this.classrooms.map(c => c.name),
      currentRow: this.rows[rowIndex]
    });
    
    // Verificar primero la modalidad actual, si es Online no permitir cambio de aula
    const currentRow = this.rows[rowIndex];
    if (currentRow && currentRow.modality === 'Online') {
      console.warn('No se puede asignar aula en modalidad virtual');
      this.patch(rowIndex, {
        room: '',
        classroomId: undefined
      });
      return;
    }
    
    // Si no hay un nombre de aula seleccionado, limpiar el ID también
    if (!selectedRoomName || !selectedRoomName.trim()) {
      this.patch(rowIndex, {
        room: '',
        classroomId: undefined
      });
      return;
    }
    
    // Buscar el aula seleccionada para obtener su ID
    const selectedClassroom = this.classrooms.find(classroom => classroom.name === selectedRoomName);
    
    if (selectedClassroom) {
      console.log('Aula encontrada:', selectedClassroom);
      // Actualizar tanto el nombre como el ID del aula
      this.patch(rowIndex, {
        room: selectedRoomName,
        classroomId: selectedClassroom.id
      });
      
      console.log('Aula actualizada:', {
        room: selectedRoomName,
        classroomId: selectedClassroom.id,
        rowAfterPatch: this.rows[rowIndex]
      });
    } else if (selectedRoomName && selectedRoomName.trim() !== '') {
      console.warn('Aula no encontrada en la base de datos:', selectedRoomName);
      // Si no se encuentra el aula en la lista pero se seleccionó algo, mostrar advertencia
      console.error('Aulas disponibles:', this.classrooms.map(c => ({name: c.name, id: c.id})));
      
      // Buscar aulas similares (por si hay un problema de mayúsculas/minúsculas)
      const lowerCaseName = selectedRoomName.toLowerCase();
      const similarClassroom = this.classrooms.find(
        c => c.name.toLowerCase() === lowerCaseName
      );
      
      if (similarClassroom) {
        console.log('Se encontró aula similar:', similarClassroom);
        this.patch(rowIndex, {
          room: similarClassroom.name, // Usar el nombre exacto como está en el backend
          classroomId: similarClassroom.id
        });
      } else {
        // Si no se encuentra nada similar, mostrar advertencia
        alert(`Advertencia: El aula "${selectedRoomName}" no existe en el sistema.`);
        this.patch(rowIndex, {
          room: '',
          classroomId: undefined
        });
      }
    } else {
      // Si se seleccionó una opción vacía, limpiar los campos
      this.patch(rowIndex, {
        room: '',
        classroomId: undefined
      });
    }
  }

  /**
   * Maneja el cambio de modalidad, limpiando el aula si es virtual
   */
  onModalityChange(rowIndex: number, selectedModality: Modality | string): void {
    console.log('onModalityChange llamado:', { rowIndex, selectedModality });
    
    // Validar modalidad seleccionada
    if (!selectedModality) {
      console.error('Modalidad inválida:', selectedModality);
      return;
    }
    
    // Convertir a formato estándar para procesamiento
    const modalityStr = String(selectedModality).toLowerCase();
    
    // Determinar si la modalidad es virtual/online
    const isOnline = modalityStr.includes('online') || modalityStr.includes('virtual');
    
    // Normalizar a tipo Modality para compatibilidad interna
    const normalizedModality: Modality = 
      isOnline ? 'Online' : 
      (modalityStr.includes('hybrid') || modalityStr.includes('híbrido') || modalityStr.includes('hibrido')) ? 'Hybrid' : 'In-Person';
    
    if (isOnline) {
      // Para modalidad online/virtual, limpiar el aula, su ID y tipo
      this.patch(rowIndex, {
        modality: normalizedModality,
        room: '',
        classroomId: undefined,
        roomType: undefined
      });
    } else if (normalizedModality === 'In-Person') {
      // Para modalidad presencial, actualizar modalidad y tipo de aula por defecto
      this.patch(rowIndex, {
        modality: normalizedModality,
        roomType: undefined // No asignar automáticamente - dejar que el usuario seleccione
      });
    } else if (normalizedModality === 'Hybrid') {
      // Para modalidad híbrida, actualizar modalidad y tipo de aula por defecto
      this.patch(rowIndex, {
        modality: normalizedModality,
        roomType: undefined // No asignar automáticamente - dejar que el usuario seleccione
      });
    } else {
      console.warn('Modalidad no reconocida:', selectedModality);
      // Usar modalidad presencial por defecto para valores desconocidos
      this.patch(rowIndex, {
        modality: 'In-Person' as Modality,
        roomType: undefined // No asignar automáticamente - dejar que el usuario seleccione
      });
    }
  }

  focus(el: HTMLInputElement | null) { 
    if (!this.editable) return;
    el?.focus(); 
    el?.showPicker?.(); 
  }

  /**
   * Función trackBy para optimizar el *ngFor y evitar re-renderizados innecesarios
   * Si el elemento tiene un ID, usa ese ID, de lo contrario usa el índice
   */
  trackByFn(index: number, item: ScheduleRow): number {
    return item?.id || index;
  }
  
  /**
   * Obtiene el valor estandarizado de modalidad para uso interno
   * Convierte los valores del backend al formato esperado por el modelo
   */
  getModalityValue(modalityDTO: ModalityDTO): Modality {
    const modalityMapping: Record<string, Modality> = {
      'Presencial': 'In-Person',
      'Virtual': 'Online',
      'Híbrido': 'Hybrid',
      'Hibrido': 'Hybrid',
      'In-Person': 'In-Person',
      'Online': 'Online',
      'Hybrid': 'Hybrid'
    };
    
    return modalityMapping[modalityDTO.name] || 'In-Person';
  }
  
  /**
   * Obtiene el nombre para mostrar en la interfaz
   * Mantiene el nombre original del backend cuando está disponible
   */
  getModalityDisplayName(modalityDTO: ModalityDTO | string): string {
    if (typeof modalityDTO === 'string') {
      // Si es un string, usar el mapa de nombres de visualización
      return this.modalityDisplayNames[modalityDTO] || modalityDTO;
    }
    
    // Usar el nombre original del backend
    return modalityDTO.name || 'Desconocido';
  }
  
  /**
   * Obtiene el valor estandarizado del tipo de aula para uso interno
   * Convierte los valores del backend al formato esperado por el modelo
   */
  getRoomTypeValue(typeDTO: ClassroomTypeDTO): 'Lecture' | 'Lab' | 'Auditorium' {
    const typeMapping: Record<string, 'Lecture' | 'Lab' | 'Auditorium'> = {
      'Aula Regular': 'Lecture',
      'Lecture': 'Lecture',
      'Laboratorio': 'Lab',
      'Lab': 'Lab',
      'Auditorio': 'Auditorium',
      'Auditorium': 'Auditorium'
    };
    
    return typeMapping[typeDTO.name] || 'Lecture';
  }
  
  /**
   * Obtiene el nombre del tipo de aula para mostrar en la interfaz
   * Mantiene el nombre original del backend cuando está disponible
   */
  getRoomTypeDisplayName(typeDTO: ClassroomTypeDTO | string): string {
    if (typeof typeDTO === 'string') {
      // Si es un string, usar el mapa de nombres de visualización
      return this.roomTypeDisplayNames[typeDTO] || typeDTO;
    }
    
    // Usar el nombre original del backend o el nombre estandarizado
    return typeDTO.name || 'Desconocido';
  }
}



