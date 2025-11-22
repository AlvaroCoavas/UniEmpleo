import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServicioDatosSupabase {
  cliente: SupabaseClient;

  constructor() {
    this.cliente = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
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

  async subirArchivo(bucket: 'cv' | 'logos' | 'fotos' | 'verificaciones', ruta: string, archivo: File) {
    return this.cliente.storage.from(bucket).upload(ruta, archivo, { upsert: true });
  }

  async sesionActual() {
    return this.cliente.auth.getSession();
  }

  async obtenerRolActual() {
    const usuario = await this.cliente.auth.getUser();
    const uid = usuario.data.user?.id;
    if (!uid) return undefined;
    const p = await this.cliente.from('personas').select('id').eq('auth_user_id', uid).maybeSingle();
    if (p.data?.id) return 'egresado';
    const e = await this.cliente.from('empresas').select('id').eq('auth_user_id', uid).maybeSingle();
    if (e.data?.id) return 'empresa';
    return undefined;
  }
}
