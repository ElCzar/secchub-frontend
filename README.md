<p align="center">
  <h1 align="center">SeccHub Frontend</h1>

  <p align="center">
    Sistema de Gestión Organizacional para la Pontificia Universidad Javeriana
    <br />
    <strong>Interfaz Web para Automatización de Creación y Asignación de Clases</strong>
  </p>
</p>

---
## Tabla de Contenidos

- [Tabla de Contenidos](#tabla-de-contenidos)
- [Acerca del Proyecto](#acerca-del-proyecto)
  - [Módulos Principales de la Interfaz](#módulos-principales-de-la-interfaz)
  - [Construido Con](#construido-con)
    - [Frameworks Principales](#frameworks-principales)
    - [Herramientas de Desarrollo](#herramientas-de-desarrollo)
    - [Herramientas Adicionales](#herramientas-adicionales)
- [Prerequisitos](#prerequisitos)
  - [Para Despliegue con Docker (Recomendado)](#para-despliegue-con-docker-recomendado)
  - [Para Despliegue Manual](#para-despliegue-manual)
  - [Herramientas Opcionales](#herramientas-opcionales)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Configuración de Entornos](#configuración-de-entornos)
    - [Variables de Entorno de Desarrollo (environment.ts)](#variables-de-entorno-de-desarrollo-environmentts)
    - [Variables de Entorno de Producción (environment.prod.ts)](#variables-de-entorno-de-producción-environmentprodts)
    - [Configuración de API URLs](#configuración-de-api-urls)
  - [Configuración de Nginx](#configuración-de-nginx)
    - [Archivo de Configuración default.conf](#archivo-de-configuración-defaultconf)
    - [Proxy de API](#proxy-de-api)
    - [Manejo de Rutas de Cliente (SPA)](#manejo-de-rutas-de-cliente-spa)
  - [Certificados SSL para HTTPS](#certificados-ssl-para-https)
    - [Opción 1: Certificados Auto-firmados (Desarrollo/Testing)](#opción-1-certificados-auto-firmados-desarrollotesting)
    - [Opción 2: Certificados de Proveedor (Producción)](#opción-2-certificados-de-proveedor-producción)
    - [Configuración de Certificados en Nginx](#configuración-de-certificados-en-nginx)
  - [Despliegue con Docker Compose](#despliegue-con-docker-compose)
    - [Paso 1: Clonar el Repositorio](#paso-1-clonar-el-repositorio)
    - [Paso 2: Configurar Entorno](#paso-2-configurar-entorno)
    - [Paso 3: Configurar Certificados SSL](#paso-3-configurar-certificados-ssl)
    - [Paso 4: Construir y Desplegar](#paso-4-construir-y-desplegar)
    - [Paso 5: Verificar el Despliegue](#paso-5-verificar-el-despliegue)
    - [Comandos Útiles de Docker Compose](#comandos-útiles-de-docker-compose)
  - [Despliegue Manual](#despliegue-manual)
    - [Paso 1: Instalar Dependencias](#paso-1-instalar-dependencias)
    - [Paso 2: Configurar Entorno](#paso-2-configurar-entorno-1)
    - [Paso 3: Compilar para Producción](#paso-3-compilar-para-producción)
    - [Paso 4: Configurar Nginx](#paso-4-configurar-nginx)
    - [Paso 5: Desplegar Archivos](#paso-5-desplegar-archivos)
- [Mantenimiento](#mantenimiento)
  - [Actualización de Dependencias](#actualización-de-dependencias)
    - [Versiones Actuales del Proyecto](#versiones-actuales-del-proyecto)
    - [Verificar Actualizaciones Disponibles](#verificar-actualizaciones-disponibles)
    - [Actualizar Dependencias](#actualizar-dependencias)
    - [Actualización de Angular](#actualización-de-angular)
    - [Calendario de Actualizaciones Recomendado](#calendario-de-actualizaciones-recomendado)
  - [Actualizaciones de Seguridad](#actualizaciones-de-seguridad)
    - [Verificar Vulnerabilidades](#verificar-vulnerabilidades)
    - [Actualizar Imágenes Docker](#actualizar-imágenes-docker)
    - [Actualización de Certificados SSL](#actualización-de-certificados-ssl)
- [Equipo de Desarrollo](#equipo-de-desarrollo)

---
## Acerca del Proyecto

**SeccHub Frontend** es la interfaz web del Sistema de Gestión Organizacional que automatiza el proceso de creación y asignación de clases dentro del Departamento de Ingeniería de Sistemas de la Pontificia Universidad Javeriana. Construido con Angular 20, proporciona una experiencia de usuario moderna y reactiva para gestionar todos los aspectos del sistema administrativo.

### Módulos Principales de la Interfaz

El frontend está estructurado en los siguientes módulos principales:

- **Módulo de Autenticación (Auth)**: Gestiona el inicio de sesión, registro y autenticación de usuarios mediante JWT.

- **Módulo de Administración (Inicio-Admi)**: Panel de administración para gestionar usuarios, roles y configuraciones del sistema.

- **Módulo de Docentes**: Interfaz para la gestión de profesores, incluyendo su información, disponibilidad y asignaciones.

- **Módulo de Monitores**: Gestión de monitores académicos y asistentes de enseñanza.

- **Módulo de Planificación**: Interfaz para la creación, asignación y gestión de horarios de clases.

- **Módulo de Solicitudes**: 
  - Solicitud de Monitores
  - Solicitud de Programas
  - Confirmación de Docentes

- **Módulo de Envío de Correo**: Interfaz para el sistema de notificaciones y comunicaciones.

- **Módulo de Gestión del Sistema**: Configuración de parámetros y administración del sistema.

- **Módulo de Log de Auditoría**: Visualización de registros de auditoría y trazabilidad.

- **Módulo de Perfil**: Gestión de perfil de usuario y preferencias.

### Construido Con

#### Frameworks Principales

- [Angular 20.3.0](https://angular.io/) - Framework principal de la aplicación
- [TypeScript 5.8.2](https://www.typescriptlang.org/) - Lenguaje de programación
- [RxJS 7.8.0](https://rxjs.dev/) - Programación reactiva
- [SCSS](https://sass-lang.com/) - Preprocesador CSS

#### Herramientas de Desarrollo

- [Node.js 22.21](https://nodejs.org/) - Entorno de ejecución
- [npm](https://www.npmjs.com/) - Gestor de paquetes
- [Angular CLI 20.3.0](https://angular.io/cli) - Herramienta de línea de comandos
- [Jasmine 5.8.0](https://jasmine.github.io/) - Framework de testing
- [Karma 6.4.0](https://karma-runner.github.io/) - Test runner

#### Herramientas Adicionales

- [XLSX 0.18.5](https://www.npmjs.com/package/xlsx) - Manejo de archivos Excel
- [xlsx-js-style 1.2.0](https://www.npmjs.com/package/xlsx-js-style) - Estilos para archivos Excel
- [Docker](https://www.docker.com/) - Contenedorización
- [Nginx](https://www.nginx.com/) - Servidor web y proxy reverso

---
## Prerequisitos

Antes de comenzar con el despliegue del aplicativo, asegúrese de tener seguir la [guía de despliegue](https://github.com/ElCzar/secchub-backend/blob/main/README.md) del componente backend instalados los siguientes componentes:

### Para Despliegue con Docker (Recomendado)

- **Docker Engine 28.0 o superior**
  ```sh
  docker --version
  ```

- **Docker Compose 2.40.0 o superior**
  ```sh
  docker compose version
  ```

### Para Despliegue Manual

- **Node.js 22.21 o superior**
  ```sh
  node --version
  ```

- **npm 10.0 o superior**
  ```sh
  npm --version
  ```

- **Nginx 1.18 o superior**
  ```sh
  nginx -v
  ```

### Herramientas Opcionales

- **Git** (para clonar el repositorio)
  ```sh
  git --version
  ```

- **OpenSSL** (para generar certificados SSL)
  ```sh
  openssl version
  ```

---
## Instalación y Configuración

### Configuración de Entornos

La aplicación utiliza diferentes archivos de configuración para entornos de desarrollo y producción ubicados en `src/environments/`.

#### Variables de Entorno de Desarrollo (environment.ts)

El archivo `src/environments/environment.ts` contiene la configuración para el entorno de desarrollo:

```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080',
    parametricBaseUrl: 'http://localhost:8080/v1',
};
```

| Variable | Descripción | Valor de Desarrollo |
|----------|-------------|---------------------|
| `production` | Indica si está en modo producción | `false` |
| `apiUrl` | URL base del API backend | `http://localhost:8080` |
| `parametricBaseUrl` | URL base para endpoints paramétricos | `http://localhost:8080/v1` |

**Nota**: Para desarrollo local, asegúrese de que el backend esté corriendo en `http://localhost:8080`.

#### Variables de Entorno de Producción (environment.prod.ts)

El archivo `src/environments/environment.prod.ts` contiene la configuración para el entorno de producción:

```typescript
export const environment = {
    production: true,
    apiUrl: 'https://secchub.com/api',
    parametricBaseUrl: 'https://secchub.com/api/v1',
};
```

| Variable | Descripción | Valor de Producción |
|----------|-------------|---------------------|
| `production` | Indica si está en modo producción | `true` |
| `apiUrl` | URL base del API backend | `https://secchub.com/api` |
| `parametricBaseUrl` | URL base para endpoints paramétricos | `https://secchub.com/api/v1` |

**CRÍTICO para Producción**: 
- Modifique `apiUrl` y `parametricBaseUrl` para que apunten al dominio de producción real.
- Las URLs deben usar HTTPS en producción.
- El proxy de Nginx redirigirá `/api/` al backend.

#### Configuración de API URLs

Para modificar las URLs del API para su entorno:

1. **Edite el archivo de entorno correspondiente** (`environment.prod.ts` para producción)
2. **Cambie las URLs** según su configuración de servidor:

```typescript
// Ejemplo para servidor de producción
export const environment = {
    production: true,
    apiUrl: 'https://su-dominio.com/api',
    parametricBaseUrl: 'https://su-dominio.com/api/v1',
};
```

3. **Reconstruya la aplicación** para que los cambios surtan efecto:
```bash
npm run build -- --configuration production
```

---
### Configuración de Nginx

Nginx actúa como servidor web y proxy reverso, sirviendo los archivos estáticos de Angular y redirigiendo las peticiones de API al backend.

#### Archivo de Configuración default.conf

El archivo `nginx/default.conf` contiene la configuración de Nginx:

```nginx
server {
    listen 80;
    server_name localhost secchub.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name localhost secchub.com;

    http2 on;

    ssl_certificate /etc/ssl/localhost.crt;
    ssl_certificate_key /etc/ssl/localhost.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;

    root /usr/share/nginx/html;
    index index.html;

    # Proxy /api/ requests to backend
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Angular app - handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Características clave:**

1. **Redirección HTTP a HTTPS**: Todo el tráfico HTTP (puerto 80) se redirige automáticamente a HTTPS (puerto 443).

2. **Soporte HTTP/2**: Habilitado para mejor rendimiento.

3. **Protocolos SSL**: Solo TLS 1.2 y 1.3 permitidos (seguridad mejorada).

#### Proxy de API

La configuración del proxy es **crítica** para la comunicación frontend-backend:

```nginx
location /api/ {
    proxy_pass http://localhost:8080/;
    # ...
}
```

**Cómo funciona:**
- Las peticiones a `https://secchub.com/api/users` se redirigen a `http://localhost:8080/users`
- El prefijo `/api/` se elimina automáticamente
- Los headers se preservan para mantener información del cliente

**Para producción con backend remoto**, modifique `proxy_pass`:

```nginx
location /api/ {
    proxy_pass https://backend-server.com/;  # URL del servidor backend
    # ...
}
```

#### Manejo de Rutas de Cliente (SPA)

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Esta configuración es **esencial** para aplicaciones Angular de página única (SPA):
- Intenta servir el archivo solicitado
- Si no existe, redirige a `index.html`
- Permite que Angular maneje el enrutamiento del lado del cliente

**Sin esta configuración**, las rutas como `/docentes` o `/planificacion` generarían errores 404 al recargar la página.

---
### Certificados SSL para HTTPS

Los certificados SSL son **requeridos** para servir la aplicación a través de HTTPS. El proyecto incluye certificados auto-firmados para desarrollo, pero en producción debe usar certificados válidos.

#### Opción 1: Certificados Auto-firmados (Desarrollo/Testing)

El proyecto incluye certificados auto-firmados en `nginx/localhost.crt` y `nginx/localhost.key`. Estos son **solo para desarrollo**.

**Para generar nuevos certificados auto-firmados:**

```bash
# Navegar al directorio nginx
cd nginx

# Generar certificado auto-firmado válido por 365 días
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key \
  -out localhost.crt \
  -subj "/C=CO/ST=Cundinamarca/L=Bogota/O=PUJ/OU=Ingenieria/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:secchub.com"
```

**Advertencia**: Los navegadores mostrarán advertencias de seguridad con certificados auto-firmados.

#### Opción 2: Certificados de Proveedor (Producción)

Para producción, debe obtener certificados SSL válidos de una Autoridad Certificadora (CA). Y hacer el debido proceso con el fin de obtener los archivos de las claves privadas y los certificados completos (fullchain).

#### Configuración de Certificados en Nginx

**Para certificados personalizados**, copie sus certificados al directorio `nginx/`:

```bash
# Copiar certificados al proyecto
cp /path/to/your/fullchain.crt nginx/localhost.crt
cp /path/to/your/privkey.key nginx/localhost.key

# Asegurar permisos correctos
chmod 644 nginx/localhost.crt
chmod 600 nginx/localhost.key
```

O monte los certificados como volumen en `docker-compose.yml`:

```yaml
volumes:
  - /etc/letsencrypt/live/secchub.com/fullchain.pem:/etc/ssl/localhost.crt:ro
  - /etc/letsencrypt/live/secchub.com/privkey.pem:/etc/ssl/localhost.key:ro
```

---
### Despliegue con Docker Compose

Este es el método **recomendado** para desplegar la aplicación en cualquier entorno.

#### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/ElCzar/secchub-frontend.git
cd secchub-frontend
```

#### Paso 2: Configurar Entorno

Edite el archivo `src/environments/environment.prod.ts` con las URLs correctas de su backend:

```typescript
export const environment = {
    production: true,
    apiUrl: 'https://su-dominio.com/api',
    parametricBaseUrl: 'https://su-dominio.com/api/v1',
};
```

**Importante**: Si el backend está en el mismo servidor, use:
```typescript
apiUrl: 'https://su-dominio.com/api',  // Nginx redirigirá a localhost:8080
```

#### Paso 3: Configurar Certificados SSL

**Opción A: Usar certificados auto-firmados (desarrollo)**

Los certificados ya están incluidos en `nginx/`. No requiere acción adicional.

**Opción B: Usar certificados de producción**
Siga las instrucciones en [Configuración de Certificados en Nginx](#configuración-de-certificados-en-nginx) para copiar o montar sus certificados.

#### Paso 4: Construir y Desplegar

```bash
# Construir y levantar el contenedor en modo detached
docker compose up --build -d
```

Este comando realizará las siguientes acciones:
1. Construye la aplicación Angular en modo producción
2. Crea una imagen Docker multi-stage optimizada
3. Configura Nginx con SSL
4. Expone los puertos 80 (HTTP) y 443 (HTTPS)
5. Levanta el servicio en modo background

#### Paso 5: Verificar el Despliegue

```bash
# Ver los logs del contenedor
docker compose logs -f frontend

# Ver el estado del contenedor
docker compose ps

# Verificar el servicio HTTP (debe redirigir a HTTPS)
curl -I http://localhost

# Verificar el servicio HTTPS
curl -k https://localhost

# O abrir en navegador
# https://localhost o https://secchub.com (si está configurado en /etc/hosts)
```

**Verificación exitosa:**
- HTTP redirige a HTTPS (código 301)
- HTTPS responde con código 200
- La aplicación carga correctamente en el navegador

#### Comandos Útiles de Docker Compose

```bash
# Detener el servicio
docker compose stop

# Iniciar el servicio detenido
docker compose start

# Reiniciar el servicio
docker compose restart

# Ver logs en tiempo real
docker compose logs -f

# Ver últimas 100 líneas de logs
docker compose logs --tail=100

# Detener y eliminar contenedor
docker compose down

# Reconstruir sin cache
docker compose build --no-cache

# Ver uso de recursos
docker stats secchub-frontend

# Acceder a la shell del contenedor
docker exec -it secchub-frontend sh

# Ver configuración de Nginx
docker exec secchub-frontend cat /etc/nginx/conf.d/default.conf
```

---
### Despliegue Manual

Si prefiere no usar Docker, puede desplegar la aplicación manualmente.

#### Paso 1: Instalar Dependencias

```bash
# Clonar el repositorio
git clone https://github.com/ElCzar/secchub-frontend.git
cd secchub-frontend

# Instalar dependencias de Node.js
npm install
```

#### Paso 2: Configurar Entorno

Edite `src/environments/environment.prod.ts` con las URLs de su backend:

```typescript
export const environment = {
    production: true,
    apiUrl: 'https://su-dominio.com/api',
    parametricBaseUrl: 'https://su-dominio.com/api/v1',
};
```

#### Paso 3: Compilar para Producción

```bash
# Compilar la aplicación en modo producción
npm run build -- --configuration production

# Los archivos compilados estarán en: dist/secchub-frontend/browser/
```

#### Paso 4: Configurar Nginx

**En Ubuntu/Debian:**

```bash
# Instalar Nginx
sudo apt-get update
sudo apt-get install nginx

# Copiar configuración
sudo cp nginx/default.conf /etc/nginx/sites-available/secchub

# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/secchub /etc/nginx/sites-enabled/

# Eliminar configuración default
sudo rm /etc/nginx/sites-enabled/default

# Copiar certificados SSL
sudo mkdir -p /etc/ssl
sudo cp nginx/localhost.crt /etc/ssl/
sudo cp nginx/localhost.key /etc/ssl/
sudo chmod 600 /etc/ssl/localhost.key

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### Paso 5: Desplegar Archivos

```bash
# Crear directorio web
sudo mkdir -p /usr/share/nginx/html

# Copiar archivos compilados
sudo cp -r dist/secchub-frontend/browser/* /usr/share/nginx/html/

# Establecer permisos
sudo chown -R www-data:www-data /usr/share/nginx/html
sudo chmod -R 755 /usr/share/nginx/html

# Verificar que Nginx esté corriendo
sudo systemctl status nginx

# Habilitar inicio automático
sudo systemctl enable nginx
```

**Verificar el despliegue:**

```bash
# Probar localmente
curl -I http://localhost

# O abrir en navegador
https://localhost
```

---
## Mantenimiento

### Actualización de Dependencias

Mantener las dependencias actualizadas es crucial para la seguridad y el rendimiento de la aplicación.

#### Versiones Actuales del Proyecto

Las versiones principales están definidas en `package.json`:

```json
{
  "dependencies": {
    "@angular/common": "^20.3.0",
    "@angular/compiler": "^20.3.0",
    "@angular/core": "^20.3.0",
    "@angular/forms": "^20.3.0",
    "@angular/platform-browser": "^20.3.0",
    "@angular/router": "^20.3.0",
    "rxjs": "~7.8.0",
    "zone.js": "~0.15.0",
    "xlsx": "^0.18.5",
    "xlsx-js-style": "^1.2.0"
  },
  "devDependencies": {
    "@angular/build": "^20.1.6",
    "@angular/cli": "^20.3.0",
    "@angular/compiler-cli": "^20.3.0",
    "typescript": "~5.8.2",
    "jasmine-core": "~5.8.0",
    "karma": "~6.4.0"
  }
}
```

#### Verificar Actualizaciones Disponibles

```bash
# Ver todas las dependencias desactualizadas
npm outdated

# Ver solo las actualizaciones mayores
npm outdated --long

# Ver información de una dependencia específica
npm info @angular/core versions
```

#### Actualizar Dependencias

**Importante**: Siempre realizar pruebas completas después de actualizar dependencias.

```bash
# Actualizar dependencias menores y parches (seguro)
npm update

# Actualizar a últimas versiones (incluyendo mayores)
npm install @angular/core@latest @angular/common@latest

# Actualizar todas las dependencias de Angular
ng update @angular/core @angular/cli

# Actualizar dependencias de desarrollo
npm install --save-dev @angular/cli@latest

# Verificar después de actualizar
npm install
npm run build -- --configuration production
npm test
```

#### Actualización de Angular

Angular proporciona herramientas específicas para actualizaciones:

```bash
# Ver qué puede actualizarse
ng update

# Actualizar Angular CLI y Core
ng update @angular/cli @angular/core

# Actualizar Angular Material (si se usa)
ng update @angular/material
```

**Importante:**
Para actualizaciones mayores de Angular siga la guía en [update.angular.io](https://update.angular.io/).


#### Calendario de Actualizaciones Recomendado

| Tipo de Actualización | Frecuencia |
|----------------------|------------|
| Parches de seguridad | Inmediatamente |
| Actualizaciones patch (x.x.X) | Semanal |
| Actualizaciones minor (x.X.0) | Mensual |
| Actualizaciones major (X.0.0) | Por release |
| Angular (major) | Cada 6 meses |
| Node.js (LTS) | Anual |

---
### Actualizaciones de Seguridad

#### Verificar Vulnerabilidades

```bash
# Auditoría de seguridad de npm
npm audit

# Ver detalles completos
npm audit --json

# Corregir vulnerabilidades automáticamente
npm audit fix

# Corregir incluyendo breaking changes
npm audit fix --force

# Ver solo vulnerabilidades de alta severidad
npm audit --audit-level=high
```

**Interpretación resultados de npm audit:**

- **Critical**: Requiere acción inmediata
- **High**: Actualizar lo antes posible
- **Moderate**: Actualizar en el próximo ciclo
- **Low**: Monitorear

#### Actualizar Imágenes Docker

```bash
# Actualizar imagen base de Node.js en el Dockerfile
# Editar Dockerfile y cambiar:
FROM node:22.21-alpine  # A la versión LTS más reciente

# Actualizar imagen de Nginx
FROM nginx:alpine  # Ya usa la última versión automáticamente

# Reconstruir con nuevas imágenes
docker compose build --no-cache --pull
docker compose up -d

# Verificar versiones
docker exec secchub-frontend node --version
docker exec secchub-frontend nginx -v
```

#### Actualización de Certificados SSL

Los certificados SSL tienen fecha de expiración y deben renovarse periódicamente. Asegúrese de renovar antes de la fecha de expiración.

---
## Equipo de Desarrollo

**Desarrolladores:**

- **Ana Sofía Rodríguez Martínez** - [anarodriguezm@javeriana.edu.co](mailto:anarodriguezm@javeriana.edu.co)

- **César Andrés Olarte Marín** - [olartecesar@javeriana.edu.co](mailto:olartecesar@javeriana.edu.co)

- **David Ricardo Gutierrez González** - [dgutierrez@javeriana.edu.co](mailto:dgutierrez@javeriana.edu.co)

- **Paola Benítez Ruiz** - [benitezpaola@javeriana.edu.co](mailto:benitezpaola@javeriana.edu.co)

**Repositorio del Proyecto:** [https://github.com/ElCzar/secchub-frontend](https://github.com/ElCzar/secchub-frontend)

**Repositorio componente backend:** [https://github.com/ElCzar/secchub-backend](https://github.com/ElCzar/secchub-backend)

---

<p align="center">
  <strong>SeccHub Frontend v1.0.0</strong><br>
  Desarrollado con ❤️ por estudiantes de la Pontificia Universidad Javeriana<br>
</p>
