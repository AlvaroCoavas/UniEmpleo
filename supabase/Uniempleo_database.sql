

CREATE TABLE public.auditoria_eventos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quien uuid,
  accion text NOT NULL,
  entidad text NOT NULL,
  entidad_id uuid,
  detalles jsonb,
  cuando timestamp with time zone NOT NULL DEFAULT now(),
  correlation_id text,
  CONSTRAINT auditoria_eventos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participantes ARRAY NOT NULL,
  ultima_actividad timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversaciones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.empresas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  razon_social text NOT NULL,
  nit text NOT NULL,
  representante_legal text NOT NULL,
  correo_corporativo text NOT NULL,
  telefono text NOT NULL,
  ciudad text NOT NULL,
  sector text NOT NULL,
  tamano text NOT NULL CHECK (tamano = ANY (ARRAY['Micro'::text, 'Pequena'::text, 'Mediana'::text, 'Grande'::text])),
  sitio_web text,
  logo_url text,
  documento_verificacion_url text,
  descripcion text,
  verificado boolean NOT NULL DEFAULT false,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT empresas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.flags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sujeto_tipo text NOT NULL CHECK (sujeto_tipo = ANY (ARRAY['persona'::text, 'empresa'::text])),
  sujeto_id uuid NOT NULL,
  motivo text NOT NULL,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.habilidades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  CONSTRAINT habilidades_pkey PRIMARY KEY (id)
);
CREATE TABLE public.intentos_login (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  contador integer NOT NULL DEFAULT 0,
  bloqueado_hasta timestamp with time zone,
  CONSTRAINT intentos_login_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mensajes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversacion_id uuid,
  remitente uuid NOT NULL,
  texto text NOT NULL,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT mensajes_conversacion_id_fkey FOREIGN KEY (conversacion_id) REFERENCES public.conversaciones(id)
);
CREATE TABLE public.personas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  nombre_completo text NOT NULL,
  tipo_documento text NOT NULL CHECK (tipo_documento = ANY (ARRAY['CC'::text, 'CE'::text, 'Pasaporte'::text])),
  numero_documento text NOT NULL,
  correo text NOT NULL,
  telefono text NOT NULL,
  ciudad text NOT NULL,
  rol_principal text NOT NULL,
  anos_experiencia integer NOT NULL CHECK (anos_experiencia >= 0),
  pretension_salarial numeric,
  disponibilidad text CHECK (disponibilidad = ANY (ARRAY['inmediata'::text, 'medio_tiempo'::text, 'remoto'::text, 'hibrido'::text])),
  resumen text,
  hoja_vida_url text,
  foto_url text,
  verificado boolean NOT NULL DEFAULT false,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT personas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.personas_habilidades (
  persona_id uuid NOT NULL,
  habilidad_id uuid NOT NULL,
  nivel integer CHECK (nivel >= 1 AND nivel <= 5),
  CONSTRAINT personas_habilidades_pkey PRIMARY KEY (persona_id, habilidad_id),
  CONSTRAINT personas_habilidades_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id),
  CONSTRAINT personas_habilidades_habilidad_id_fkey FOREIGN KEY (habilidad_id) REFERENCES public.habilidades(id)
);
CREATE TABLE public.postulaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vacante_id uuid,
  persona_id uuid,
  estado text NOT NULL CHECK (estado = ANY (ARRAY['creada'::text, 'revision'::text, 'entrevista'::text, 'oferta'::text, 'rechazada'::text, 'contratada'::text])),
  puntaje numeric,
  creada_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizada_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT postulaciones_pkey PRIMARY KEY (id),
  CONSTRAINT postulaciones_vacante_id_fkey FOREIGN KEY (vacante_id) REFERENCES public.vacantes(id),
  CONSTRAINT postulaciones_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['persona'::text, 'empresa'::text])),
  autor_id uuid NOT NULL,
  sujeto_id uuid NOT NULL,
  calificacion integer NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario text,
  creada_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vacantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid,
  titulo text NOT NULL,
  descripcion text NOT NULL,
  ubicacion text,
  salario numeric,
  modalidad text CHECK (modalidad = ANY (ARRAY['presencial'::text, 'remoto'::text, 'hibrido'::text])),
  requisitos text,
  estado text NOT NULL DEFAULT 'activa'::text CHECK (estado = ANY (ARRAY['activa'::text, 'cerrada'::text, 'pausada'::text])),
  creada_en timestamp with time zone NOT NULL DEFAULT now(),
  expira_en timestamp with time zone,
  CONSTRAINT vacantes_pkey PRIMARY KEY (id),
  CONSTRAINT vacantes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
CREATE TABLE public.vacantes_habilidades (
  vacante_id uuid NOT NULL,
  habilidad_id uuid NOT NULL,
  requerida boolean NOT NULL DEFAULT true,
  peso integer NOT NULL DEFAULT 1,
  CONSTRAINT vacantes_habilidades_pkey PRIMARY KEY (vacante_id, habilidad_id),
  CONSTRAINT vacantes_habilidades_vacante_id_fkey FOREIGN KEY (vacante_id) REFERENCES public.vacantes(id),
  CONSTRAINT vacantes_habilidades_habilidad_id_fkey FOREIGN KEY (habilidad_id) REFERENCES public.habilidades(id)
);
CREATE TABLE public.verificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sujeto_tipo text NOT NULL CHECK (sujeto_tipo = ANY (ARRAY['persona'::text, 'empresa'::text])),
  sujeto_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['identidad'::text, 'documento'::text, 'correo'::text, 'telefono'::text])),
  estado text NOT NULL CHECK (estado = ANY (ARRAY['pendiente'::text, 'aprobado'::text, 'rechazado'::text])),
  proveedor text,
  intento integer NOT NULL DEFAULT 1,
  resultado jsonb,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT verificaciones_pkey PRIMARY KEY (id)
);