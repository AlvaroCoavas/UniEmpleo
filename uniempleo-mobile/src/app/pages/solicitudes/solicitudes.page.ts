import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaginaSolicitudes implements OnInit, OnDestroy {
  solicitudes: any[] = [];
  cargando = false;
  ultimaActualizacion = Date.now();
  private ch: any;
  private mostroDiag = false;
  modalAbierto = false;
  perfilSeleccionado: any | null = null;
  habilidadesSeleccionadas: any[] = [];

  constructor(
    private vacantes: ServicioVacantes,
    private alertas: AlertController,
    private supa: ServicioDatosSupabase
  ) {}

  async ngOnInit() {
    await this.cargar();
    this.ch = await this.vacantes.suscribirPostulacionesEmpresa(async () => {
      await this.cargar();
    });
  }

  async cargar() {
    this.cargando = true;
    try {
      this.solicitudes =
        await this.vacantes.listarPostulacionesPendientesEmpresa();
    } catch {
      this.solicitudes = [];
    } finally {
      this.cargando = false;
      this.ultimaActualizacion = Date.now();
      if (!this.cargando && this.solicitudes.length === 0 && !this.mostroDiag) {
        await this.mostrarDiagnostico();
      }
    }
  }

  async verPerfil(s: any) {
    this.modalAbierto = true;
    const base = s?.persona || null;
    if (!base?.id) {
      this.perfilSeleccionado = base;
      this.habilidadesSeleccionadas = [];
      return;
    }
    try {
      const p = await this.supa.cliente
        .from('personas')
        .select(
          'id,auth_user_id,nombre_completo,tipo_documento,numero_documento,correo,telefono,ciudad,rol_principal,anos_experiencia,pretension_salarial,disponibilidad,resumen,hoja_vida_url,foto_url,verificado'
        )
        .eq('id', base.id)
        .maybeSingle();
      this.perfilSeleccionado = p.data || base;
      const hs = await this.supa.cliente
        .from('personas_habilidades')
        .select('nivel, habilidad:habilidad_id(id,nombre)')
        .eq('persona_id', base.id);
      this.habilidadesSeleccionadas = (hs.data || []) as any[];
    } catch {
      this.perfilSeleccionado = base;
      this.habilidadesSeleccionadas = [];
    }
  }

  cerrarPerfil() {
    this.modalAbierto = false;
    this.perfilSeleccionado = null;
    this.habilidadesSeleccionadas = [];
  }

  async aceptar(s: any) {
    try {
      await this.vacantes.aceptarPostulacion(s.id);
      const alerta = await this.alertas.create({
        header: 'Postulación',
        message: 'Solicitud aceptada. Se abrió el chat con el postulante.',
        buttons: ['OK'],
      });
      await alerta.present();
      await this.cargar();
    } catch (e: any) {
      const msg = String(e?.message || 'No fue posible aceptar');
      const mensaje = msg.includes('actualizado_en')
        ? 'Error de base de datos: el trigger espera la columna "actualizado_en" en la tabla "postulaciones". Renombra la columna "actualizada_en" a "actualizado_en" o ajusta el trigger para usar el nombre correcto.'
        : msg;
      const alerta = await this.alertas.create({
        header: 'Error',
        message: mensaje,
        buttons: ['OK'],
      });
      await alerta.present();
    }
  }

  async renegar(s: any) {
    try {
      await this.vacantes.rechazarPostulacion(s.id);
      const alerta = await this.alertas.create({
        header: 'Postulación',
        message: 'Solicitud rechazada.',
        buttons: ['OK'],
      });
      await alerta.present();
      await this.cargar();
    } catch (e: any) {
      const msg = String(e?.message || 'No fue posible rechazar');
      const mensaje = msg.includes('actualizado_en')
        ? 'Error de base de datos: el trigger espera la columna "actualizado_en" en la tabla "postulaciones". Renombra la columna "actualizada_en" a "actualizado_en" o ajusta el trigger para usar el nombre correcto.'
        : msg;
      const alerta = await this.alertas.create({
        header: 'Error',
        message: mensaje,
        buttons: ['OK'],
      });
      await alerta.present();
    }
  }

  inicial(s: any) {
    const n = String(s?.persona?.nombre_completo || '').trim();
    return n ? n[0].toUpperCase() : 'U';
  }

  nombreUsuario(s: any) {
    const n = String(s?.persona?.nombre_completo || '').trim();
    if (n) return n;
    const c = String(s?.persona?.correo || '').trim();
    if (c) return c.split('@')[0];
    return '';
  }

  ngOnDestroy() {
    try {
      this.ch?.unsubscribe();
    } catch {}
  }

  private async mostrarDiagnostico() {
    let mensaje = '';
    try {
      const empresa = await this.supa.obtenerEmpresaActual();
      if (!empresa) {
        mensaje =
          'No hay empresa asociada a tu sesión. Inicia sesión como empresa o completa el registro.';
      } else {
        const empresaIds = [empresa.id, (empresa as any).auth_user_id].filter(
          Boolean
        );
        const vacs = await this.supa.cliente
          .from('vacantes')
          .select('id')
          .in('empresa_id', empresaIds as any);
        const vacIds = (vacs.data || []).map((v: any) => v.id);
        if (!vacIds.length) {
          mensaje =
            'Tu empresa no tiene vacantes activas. Crea una vacante para recibir solicitudes.';
        } else {
          const pos = await this.supa.cliente
            .from('postulaciones')
            .select('id,persona_id')
            .in('vacante_id', vacIds)
            .eq('estado', 'creada');
          const filas = pos.data || [];
          if (!filas.length) {
            mensaje =
              "No hay postulaciones con estado 'creada' para tus vacantes.";
          } else {
            const personaIds = filas
              .map((r: any) => r.persona_id)
              .filter(Boolean)
              .slice(0, 5);
            if (personaIds.length) {
              const pr = await this.supa.cliente
                .from('personas')
                .select('id')
                .in('id', personaIds);
              if (pr.error || !(pr.data || []).length) {
                mensaje =
                  'Las políticas de seguridad (RLS) bloquean la lectura de datos de personas relacionadas. Ajusta las políticas SELECT/UPDATE para personas y postulaciones.';
              }
            }
            if (!mensaje)
              mensaje =
                'No se pudieron mostrar datos por restricciones de lectura o datos incompletos.';
          }
        }
      }
    } catch (e: any) {
      mensaje = String(e?.message || 'Error desconocido al diagnosticar.');
    }
    const alerta = await this.alertas.create({
      header: 'Solicitudes',
      message: mensaje,
      buttons: ['OK'],
    });
    await alerta.present();
    this.mostroDiag = true;
  }
}
