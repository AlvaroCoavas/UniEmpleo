## Visión General
- Objetivo: automatizar emparejamientos, registrar trazabilidad 100% y reforzar validación/seguridad.
- Alcance inicial: app móvil Ionic/Angular ya existente + backend con Firebase Cloud Functions y Firestore.
- Estilo de código: variables y clases en español, nombres sencillos y entendibles.

## Arquitectura
- Cliente: `uniempleo-mobile` (Ionic Angular 8, Angular 20, Firebase Auth/Firestore).
- Backend: Firebase Cloud Functions (HTTPS + triggers) con `functionsBaseUrl` configurado en `environment*`.
- Datos: Firestore colecciones nuevas para postulaciones, verificaciones, reviews, banderas, auditorias, configuraciones de scoring.
- Opcional: Supabase para reportes analíticos (si se requiere SQL/ETL), no imprescindible.

## Datos y Modelos
- Ampliar `Vacante` (`src/app/models/vacante.ts`): `habilidades: string[]`, `ubicacion`, `disponibilidad`, `tarifa`/`salario`, `modalidad`.
- Crear `PerfilCandidato` (`src/app/models/usuario.ts` o nuevo `perfil-candidato.ts`): `habilidades`, `disponibilidad`, `ubicacion`, `tarifaPreferida`, `documentosVerificados`.
- Colecciones nuevas:
  - `postulaciones`: `{ candidatoId, vacanteId, estado, puntaje, fechas }`.
  - `vacantes_matches`: caché de coincidencias calculadas por backend.
  - `verificaciones`: KYC/documentos/estado de verificación.
  - `reviews`: `{ de, para, vacanteId, estrellas, comentario, verificada }`.
  - `flags`: comportamiento sospechoso con razón y contador.
  - `auditorias`: logs `{ quienId, accion, cuando, detalle, referencia }`.
  - `config_scoring`: pesos `{ habilidades, disponibilidad, ubicacion, tarifa }`.

## Emparejamiento Automático
- Regla de scoring (simple y transparente):
  - `puntaje = wH*coincidenciaHabilidades + wD*coincidenciaDisponibilidad + wU*coincidenciaUbicacion + wT*coincidenciaTarifa`.
  - `coincidenciaHabilidades`: % de habilidades de la vacante presentes en el candidato.
  - `coincidenciaDisponibilidad`: exacta o parcial según horarios.
  - `coincidenciaUbicacion`: cercanía por ciudad/municipio; si remoto, max.
  - `coincidenciaTarifa`: dentro de rango → alto, fuera → bajo.
- Backend calcula y escribe en `vacantes_matches` para cada vacante nueva y al actualizar perfil.
- Cliente muestra sugerencias ordenadas por `puntaje` y etiqueta si es automático vs. manual.
- Métrica: registrar origen (`automatico`/`manual`) en `postulaciones` y generar reporte del porcentaje.

## Trazabilidad Completa
- Middleware/servicio de auditoría en cliente y backend: función `guardarAuditoria(accion, referencia, detalle)`.
- Acciones registradas: publicación/edición/cierre vacante, postulaciones, mensajes, decisiones (aceptar/rechazar), verificaciones, cambios de estado.
- Reporte: consultas por rango de fechas, por usuario, por vacante; exportación.
- Auditoría 100%: cada operación de UI llama al servicio; los procesos automáticos (matching/triggers) también.

## Validación y Seguridad
- Verificación de identidad: usar Firebase Auth + recolección de documentos en `verificaciones` (DNI, certificado, etc.).
- Reputación y reviews: sólo permitir reviews si hubo contratación/verificación; marcar `verificada: true` cuando se compruebe.
- Alertas de comportamiento sospechoso:
  - Muchos rechazos en poco tiempo, mensajes con spam, cambios de tarifa extremos.
  - Escribir en `flags` y notificar moderación.
- Métricas: `% perfiles verificados`, `reducción de incidencias`, `tiempos de validación` (diferencia entre `solicitadoVerificacionAt` y `verificadoAt`).

## Métricas y Reportes
- Colección `reportes_kpi`: snapshots diarios/semanales con valores:
  - `porcentajeEmparejamientosAutomaticos`, `auditoriasCompletas`, `perfilesVerificados`, `incidencias`, `tiempoMedioValidacion`.
- Endpoint backend `GET /reportes/kpi` y `POST /reportes/recalcular`.
- Pantalla admin simple en móvil para visualizar KPIs.

## Implementación en App Móvil
- Páginas existentes a ampliar:
  - `publicar-vacante` (`src/app/pages/publicar-vacante/*`): nuevos campos de filtros (habilidades, disponibilidad, ubicación, tarifa).
  - `mis-vacantes`: ver postulaciones y sugerencias automáticas con puntaje.
  - `feed`: mostrar vacantes recomendadas al candidato.
  - `chat`: vincular conversación a `postulacionId` y registrar auditoría.
- Servicios nuevos:
  - `ServicioEmparejamiento`: fetch de `vacantes_matches`, cálculo local simple si el backend no responde.
  - `ServicioTrazabilidad`: `guardarAuditoria` centralizado.
  - `ServicioVerificacion`: subir y chequear documentos, estado del perfil.
- Estilo de código: nombres como `servicioEmparejamiento`, `calcularPuntaje`, `guardarAuditoria`, `esPerfilVerificado`.

## Backend y Configuración
- Cloud Functions:
  - `POST /matching/recalcular` para una vacante o candidato.
  - `GET /matching/vacante/:id` devuelve lista de candidatos con puntaje.
  - `POST /postulaciones` crea y etiqueta origen; `PATCH /postulaciones/:id` cambios de estado.
  - `GET /reportes/kpi` genera KPIs desde auditorías y postulaciones.
  - Triggers Firestore: onCreate/Update de `vacantes`, `usuarios`/perfiles → recalcular emparejamientos.
- Configurar `environment.functionsBaseUrl` (dev/prod) y usar desde `ServicioFeed` y servicios nuevos.

## Entregables Iniciales (Fase 1–2)
- Ampliar modelos y formularios de `publicar-vacante` y perfil candidato.
- Servicios `Emparejamiento`, `Trazabilidad`, `Verificacion` en móvil.
- Funciones backend mínimas: cálculo de puntaje y endpoints de listado.
- KPIs básicos y pantalla admin simple.

## Nombres y Estilo
- Todo el código en español, variables y funciones con nombres claros y no rebuscados.
- Evitar sobre-ingeniería: lógica directa y legible, comentarios escasos.

¿Confirmas que avancemos con esta implementación y cree los servicios, modelos y endpoints descritos?