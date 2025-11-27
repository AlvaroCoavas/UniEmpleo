# Configuración del Dashboard de Administrador

## Cómo configurar el acceso de administrador

Para acceder al dashboard de administrador, necesitas agregar tu email a la lista de administradores.

### Paso 1: Editar el servicio de administración

Abre el archivo: `src/app/services/admin.service.ts`

En la línea donde dice:
```typescript
private readonly adminEmails = [
  'admin@uniempleo.com',
  // Agrega más emails de admin aquí
];
```

Agrega tu email de administrador, por ejemplo:
```typescript
private readonly adminEmails = [
  'admin@uniempleo.com',
  'tu-email@ejemplo.com',  // Tu email aquí
];
```

### Paso 2: Acceder al dashboard

1. Inicia sesión con el email que agregaste como administrador
2. Serás redirigido automáticamente al dashboard de administración
3. También puedes acceder desde el botón "Admin" en el header de la aplicación (solo visible para administradores)
4. O navega directamente a: `http://localhost:4200/admin`

## Funcionalidades del Dashboard

### Pestaña de Estadísticas
- Total de usuarios (personas + empresas)
- Total de vacantes
- Total de noticias
- Total de postulaciones
- Total de conversaciones y mensajes
- Postulaciones por estado
- Vacantes por estado

### Pestaña de Usuarios
- Lista de todas las personas registradas
- Lista de todas las empresas registradas
- Opción de eliminar usuarios

### Pestaña de Vacantes
- Lista de todas las vacantes publicadas
- Estado de cada vacante
- Opción de eliminar vacantes

### Pestaña de Noticias
- Lista de todas las noticias publicadas
- Información de cada noticia
- Opción de eliminar noticias

### Pestaña de Postulaciones
- Lista de todas las postulaciones
- Estado de cada postulación
- Opción de eliminar postulaciones

## Notas importantes

- El dashboard está protegido por un guard que verifica si el usuario es administrador
- Solo los emails en la lista `adminEmails` pueden acceder
- Todas las acciones de eliminación requieren confirmación
- Los datos se actualizan en tiempo real cuando se realizan cambios

