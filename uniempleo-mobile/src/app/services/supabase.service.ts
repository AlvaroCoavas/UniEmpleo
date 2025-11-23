import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServicioDatosSupabase {
  cliente: SupabaseClient;

  constructor() {
    const g = globalThis as any;
    if (g.__supabaseClient) {
      this.cliente = g.__supabaseClient as SupabaseClient;
    } else {
      this.cliente = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      g.__supabaseClient = this.cliente;
    }
  }

  async iniciarSesion(correo: string, contrasena: string) {
    return this.cliente.auth.signInWithPassword({ email: correo, password: contrasena });
  }

  async cerrarSesion() {
    return this.cliente.auth.signOut();
  }

  async enviarCorreoRecuperacion(correo: string) {
    return this.cliente.auth.resetPasswordForEmail(correo);
  }

  async registrarPersonaNatural(datos: {
    nombreCompleto: string;
    tipoDocumento: 'CC' | 'CE' | 'Pasaporte';
    numeroDocumento: string;
    correo: string;
    contrasena: string;
    telefono: string;
    ciudad: string;
    rolPrincipal: string;
    experienciaAnios: number;
    habilidades: string[];
    resumen?: string;
    pretension?: number | null;
    disponibilidad?: 'inmediata' | 'medio_tiempo' | 'remoto' | 'hibrido' | null;
    urlHojaVida?: string | null;
    urlFoto?: string | null;
    aceptaTerminos: boolean;
  }) {
    const registro = await this.cliente.auth.signUp({
      email: datos.correo,
      password: datos.contrasena,
      options: { data: { rol: 'persona' } },
    });
    if (registro.error) throw new Error(`supabase_signUp_persona: ${registro.error.message}`);
    if (!registro.data.session) {
      const inicio = await this.cliente.auth.signInWithPassword({ email: datos.correo, password: datos.contrasena });
      if (inicio.error) throw new Error(`supabase_signIn_persona: ${inicio.error.message}`);
    }
    const usuarioId = registro.data.user?.id as string;
    const insercion = await this.cliente
      .from('personas')
      .insert({
        auth_user_id: usuarioId,
        nombre_completo: datos.nombreCompleto,
        tipo_documento: datos.tipoDocumento,
        numero_documento: datos.numeroDocumento,
        correo: datos.correo,
        telefono: datos.telefono,
        ciudad: datos.ciudad,
        rol_principal: datos.rolPrincipal,
        anos_experiencia: datos.experienciaAnios,
        resumen: datos.resumen ?? null,
        pretension_salarial: datos.pretension ?? null,
        disponibilidad: datos.disponibilidad ?? null,
        hoja_vida_url: datos.urlHojaVida ?? null,
        foto_url: datos.urlFoto ?? null,
      })
      .select('id')
      .single();
    if (insercion.error) throw new Error(`supabase_insert_persona: ${insercion.error.message}`);
    const personaId = insercion.data?.id as string;
    if (datos.habilidades?.length) {
      const habilidadesFilas = datos.habilidades.map((h) => ({ nombre: h }));
      const up = await this.cliente.from('habilidades').upsert(habilidadesFilas, { onConflict: 'nombre' });
      if (up.error) throw new Error(`supabase_upsert_habilidades: ${up.error.message}`);
      const habilidadesConsulta = await this.cliente
        .from('habilidades')
        .select('id,nombre')
        .in('nombre', datos.habilidades);
      if (habilidadesConsulta.error) throw new Error(`supabase_select_habilidades: ${habilidadesConsulta.error.message}`);
      const relacion = (habilidadesConsulta.data || []).map((h: any) => ({ persona_id: personaId, habilidad_id: h.id }));
      if (relacion.length) {
        const upRel = await this.cliente.from('personas_habilidades').upsert(relacion, { onConflict: 'persona_id,habilidad_id' });
        if (upRel.error) throw new Error(`supabase_upsert_personas_habilidades: ${upRel.error.message}`);
      }
    }
    return registro;
  }

  async registrarEmpresa(datos: {
    razonSocial: string;
    nit: string;
    representante: string;
    correoCorporativo: string;
    telefono: string;
    ciudad: string;
    sector: string;
    tamano: 'Micro' | 'Pequena' | 'Mediana' | 'Grande';
    contrasena: string;
    sitioWeb?: string | null;
    logoUrl?: string | null;
    docVerificacionUrl?: string | null;
    descripcion?: string | null;
    aceptaTerminos: boolean;
  }) {
    const registro = await this.cliente.auth.signUp({
      email: datos.correoCorporativo,
      password: datos.contrasena,
      options: { data: { rol: 'empresa' } },
    });
    if (registro.error) throw new Error(`supabase_signUp_empresa: ${registro.error.message}`);
    if (!registro.data.session) {
      const inicio = await this.cliente.auth.signInWithPassword({ email: datos.correoCorporativo, password: datos.contrasena });
      if (inicio.error) throw new Error(`supabase_signIn_empresa: ${inicio.error.message}`);
    }
    const usuarioId = registro.data.user?.id as string;
    const ins = await this.cliente.from('empresas').insert({
      id: usuarioId,
      auth_user_id: usuarioId,
      razon_social: datos.razonSocial,
      nit: datos.nit,
      representante_legal: datos.representante,
      correo_corporativo: datos.correoCorporativo,
      telefono: datos.telefono,
      ciudad: datos.ciudad,
      sector: datos.sector,
      tamano: datos.tamano,
      sitio_web: datos.sitioWeb ?? null,
      logo_url: datos.logoUrl ?? null,
      documento_verificacion_url: datos.docVerificacionUrl ?? null,
      descripcion: datos.descripcion ?? null,
    });
    if (ins.error) throw new Error(`supabase_insert_empresa: ${ins.error.message}`);
    return registro;
  }

  async subirArchivo(bucket: 'cv' | 'logos' | 'fotos' | 'verificaciones' | 'videos', ruta: string, archivo: File) {
    return this.cliente.storage.from(bucket).upload(ruta, archivo, { upsert: true });
  }

  async sesionActual() {
    return this.cliente.auth.getSession();
  }

  async obtenerRolActual() {
    const usuario = await this.cliente.auth.getUser();
    const uid = usuario.data.user?.id;
    const meta = (usuario.data.user as any)?.user_metadata?.rol as string | undefined;
    if (meta === 'persona') return 'egresado';
    if (meta === 'empresa') return 'empresa';
    if (!uid) return undefined;
    const p = await this.cliente.from('personas').select('id').eq('auth_user_id', uid).maybeSingle();
    if (p.data?.id) return 'egresado';
    const e = await this.cliente.from('empresas').select('id').eq('auth_user_id', uid).maybeSingle();
    if (e.data?.id) return 'empresa';
    return undefined;
  }
  async obtenerEmpresaPorId(id: string) {
    let res = await this.cliente.from('empresas').select('*').eq('id', id).maybeSingle();
    if (res.error) throw new Error(`supabase_get_empresa: ${res.error.message}`);
    if (res.data) return res.data;
    res = await this.cliente.from('empresas').select('*').eq('auth_user_id', id).maybeSingle();
    if (res.data) return res.data;
    res = await this.cliente.from('empresas').select('*').eq('correo_corporativo', id).maybeSingle();
    return res.data;
  }

  async obtenerEmpresaActual() {
    const usuario = await this.cliente.auth.getUser();
    const uid = usuario.data.user?.id;
    const email = usuario.data.user?.email || undefined;
    if (!uid) return undefined;
    let res = await this.cliente.from('empresas').select('*').eq('auth_user_id', uid).maybeSingle();
    if (res.error) throw new Error(`supabase_get_empresa_actual: ${res.error.message}`);
    if (res.data) return res.data;
    // Fallbacks por compatibilidad de datos antiguos
    res = await this.cliente.from('empresas').select('*').eq('id', uid).maybeSingle();
    if (res.data) return res.data;
    if (email) {
      const r2 = await this.cliente.from('empresas').select('*').eq('correo_corporativo', email).maybeSingle();
      if (!r2.error && r2.data) return r2.data;
    }
    return undefined;
  }

  async obtenerPersonaActual() {
    const usuario = await this.cliente.auth.getUser();
    const uid = usuario.data.user?.id;
    if (!uid) return undefined;
    const res = await this.cliente.from('personas').select('*').eq('auth_user_id', uid).maybeSingle();
    if (res.error) throw new Error(`supabase_get_persona: ${res.error.message}`);
    return res.data;
  }

  async actualizarPersonaActual(patch: {
    nombre_completo?: string;
    ciudad?: string;
    rol_principal?: string;
    anos_experiencia?: number;
    disponibilidad?: string;
    resumen?: string;
  }) {
    const usuario = await this.cliente.auth.getUser();
    const uid = usuario.data.user?.id;
    if (!uid) throw new Error('supabase_update_persona: usuario no autenticado');
    const res = await this.cliente
      .from('personas')
      .update(patch as any)
      .eq('auth_user_id', uid)
      .select('*')
      .maybeSingle();
    if (res.error) throw new Error(`supabase_update_persona: ${res.error.message}`);
    return res.data;
  }

  async actualizarEmpresaActual(patch: {
    razon_social?: string;
    ciudad?: string;
    sector?: string;
    tamano?: string;
    sitio_web?: string | null;
    descripcion?: string | null;
    telefono?: string;
  }) {
    const usuario = await this.cliente.auth.getUser();
    const uid = usuario.data.user?.id;
    if (!uid) throw new Error('supabase_update_empresa: usuario no autenticado');
    const res = await this.cliente
      .from('empresas')
      .update(patch as any)
      .eq('auth_user_id', uid)
      .select('*')
      .maybeSingle();
    if (res.error) throw new Error(`supabase_update_empresa: ${res.error.message}`);
    return res.data;
  }
  async listarPersonas(limit = 8) {
    const res = await this.cliente
      .from('personas')
      .select('id,nombre_completo,correo,ciudad,rol_principal')
      .limit(limit);
    if (res.error) throw new Error(`supabase_listar_personas: ${res.error.message}`);
    return res.data || [];
  }

  async listarEmpresas(limit = 8) {
    const res = await this.cliente
      .from('empresas')
      .select('id,razon_social,correo_corporativo,ciudad,sector')
      .limit(limit);
    if (res.error) throw new Error(`supabase_listar_empresas: ${res.error.message}`);
    return res.data || [];
  }
}
