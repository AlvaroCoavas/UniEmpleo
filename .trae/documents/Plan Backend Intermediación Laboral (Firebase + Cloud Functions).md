## Objetivo
Backend que automatiza la intermediación laboral con: emparejamiento automático, trazabilidad completa y validaciones de seguridad.

## Arquitectura
- Autenticación: Firebase Auth con custom claims (`egresado`, `empresa`, `admin`).
- Datos: Firestore para entidades core y Storage para documentos (CV, certificados).
- Lógica: Cloud Functions (HTTPS + triggers); orquestación, scoring y auditoría.
- Jobs: Cloud Scheduler + Cloud Tasks (recalcular scoring, reportes programados).
- Observabilidad: export a BigQuery (KPIs y auditoría); alertas en Cloud Monitoring.
- Notificaciones: FCM para eventos clave (nueva vacante, cambios en postulación, mensajes).

## Modelo de Datos (Firestore)
- `usuarios`: perfil egresado (habilidades, experiencia, ubicación, disponibilidad, verificación).
- `empresas`: perfil empresa (razón social, contacto, verificación, reputación).
- `vacantes`: requisitos (habilidades, ubicación, modalidad, rango salarial, expiración).
- `postulaciones`: estado del proceso (creada, revisión, entrevista, oferta, rechazada, contratada) + timestamps.
- `conversations` / `messages`: chat por postulación y general.
- `verificaciones`: identidad/documentos (estado, proveedor, intentos, resultado).
- `reviews`: reputación tras contratación (vinculadas a `postulaciones` contratadas).
- `flags`: reportes/alertas de comportamiento sospechoso.
- `audit_logs`: registro append-only (quién, acción, entidad, `correlationId`, timestamp).
- `vacantes_matches`: resultados de emparejamiento (vacanteId, candidatoId, score, razones).

## Emparejamiento y Scoring
- Filtros duros: requisitos obligatorios, ubicación (radio o región), modalidad, rango salarial/ tarifas, disponibilidad.
- Scoring ponderado (configurable):
  - habilidades (exactas y sinónimos), experiencia, seniority, reputación, compatibilidad horaria.
  - pesos en `config/scoring` editables por admin.
- Implementación:
  - Función `matchVacantes`: calcula candidatos por vacante, guarda en `vacantes_matches` y notifica.
  - Función `matchCandidatos`: calcula vacantes por candidato (cuando edita perfil).
  - Programación: recalculo nocturno vía Scheduler.
- Métrica: % coincidencias automáticas vs. manuales, tasa de conversión por `score`.

## Trazabilidad Completa
- Wrapper de auditoría: todas las funciones escriben en `audit_logs` con contexto y `correlationId`.
- Estados de `postulaciones`: transiciones validadas (empresas mueven estados, egresados aceptan/rechazan ofertas).
- Reportes automáticos:
  - KPIs: tiempo de respuesta por etapa, tasa entrevistas/ofertas/contrataciones.
  - Export a BigQuery y panel en Looker/Data Studio.
- Métrica: auditoría del 100% de interacciones y generación programada de reportes.

## Seguridad y Validación
- Verificación de identidad: integración KYC (ej. Persona/Onfido) vía Cloud Functions; almacenar sólo metadatos y estados.
- Validación de documentos: subida a Storage con validaciones (tamaño/mime; antivirus opcional); extracción de metadatos.
- Reputación y reviews: sólo tras contratación; detección de colusión (IPs, tiempos, reciprocidad).
- Anti-fraude:
  - Rate limiting por IP/uid en HTTPS Functions.
  - reCAPTCHA en acciones sensibles (registro, publicación de vacante).
  - Heurísticas de riesgo (múltiples cuentas en mismo dispositivo, mensajes masivos, cambios frecuentes).
  - Alertas y `flags` automáticos.
- Reglas Firestore: acceso por rol y ownership; validaciones de esquema y rangos; restricciones de actualización.
- Métrica: reducción de incidencias, % perfiles verificados, tiempo promedio de validación.

## Endpoints (HTTPS Functions)
- `POST /roles/set` (admin): asignar claims.
- `POST /vacantes` (empresa): crear/actualizar/eliminar.
- `GET /vacantes/:id/matches` (empresa/admin): ver candidatos y `score`.
- `POST /postulaciones` (egresado): crear; `PATCH /postulaciones/:id` (empresa/egresado según transición).
- `POST /matching/run` (admin/scheduler): recalcular emparejamientos.
- `POST /verificaciones/start` / `GET /verificaciones/:uid`: iniciar y consultar KYC.
- `GET /reportes/kpi`: métricas para panel.

## Triggers (Cloud Functions)
- `onCreate/onUpdate` en `vacantes` y `postulaciones`: auditoría, notificaciones y cola de matching.
- `onWrite` en `reviews`: actualizar reputación.
- `onWrite` en `flags`: alertar y bloquear si aplica.

## Reglas Firestore (ejemplos)
- `vacantes`: escribe solo empresa dueña; lectura pública sin datos sensibles.
- `postulaciones`: crear egresado; actualizar estados empresa; lectura protegida por participantes.
- `verificaciones`: lectura propia/admin; escritura solo backend.
- `messages`: acceso sólo participantes; límites.

## Métricas y Paneles
- Coincidencias automáticas vs manuales.
- Tiempo de respuesta por etapa y funneles.
- % perfiles verificados y tiempos KYC.
- Incidencias/flags por periodo y tasa de fraude.

## Fases de Implementación
1. Base: Auth con roles, colecciones y reglas mínimas, audit wrapper.
2. CRUD: vacantes y postulaciones con estados y notificaciones.
3. Matching: filtros duros + scoring; Scheduler y métricas.
4. Validación: KYC y documentos; reputación y reviews.
5. Trazabilidad: export BigQuery y endpoints de reportes; paneles.
6. Seguridad avanzada: rate limits, reCAPTCHA y alertas.

## Requisitos Externos
- `firebaseConfig`, habilitar Auth/Firestore/Storage/Functions.
- Cuenta de facturación para Functions/BigQuery.
- Proveedor KYC y política de retención de datos.
- Definir pesos de scoring y taxonomía de habilidades.

¿Confirmas este plan para comenzar el backend con Firebase/Cloud Functions alineado a tus objetivos?