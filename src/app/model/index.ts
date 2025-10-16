/**
 * Barrel export for all DTOs
 * Facilita la importación desde un solo punto
 */

// User DTOs
export * from './dto/registrados/user-register-request.dto';

// Teacher DTOs
export * from './dto/registrados/teacher-response.dto';
export * from './dto/registrados/teacher-create-request.dto';
export * from './dto/registrados/teacher-register-request.dto';
export * from './dto/registrados/teacher-update-request.dto';

// Section DTOs
export * from './dto/registrados/section-response.dto';
export * from './dto/registrados/section-create-request.dto';
export * from './dto/registrados/section-register-request.dto';

// Course DTOs
export * from './dto/registrados/course-response.dto';
export * from './dto/registrados/course-request.dto';

// Semester DTOs
export * from './dto/registrados/semester-response.dto';
export * from './dto/registrados/semester-request.dto';

// Profile DTOs
export * from './dto/perfil/user-profile-response.dto';
export * from './dto/perfil/user-profile-update-request.dto';