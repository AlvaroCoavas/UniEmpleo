import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-solicitudes-persona',
  templateUrl: './solicitudes-persona.page.html',
  styleUrls: ['./solicitudes-persona.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaginaSolicitudesPersona implements OnInit, OnDestroy {
  solicitudes: any[] = [];
  cargando = false;
  ultimaActualizacion = Date.now();
  private ch: any;
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
    this.ch = await this.vacantes.suscribirPostulacionesPersona(async () => {
      await this.cargar();
    });
  }

  async cargar() {
    this.cargando = true;
    try {
      console.log('Cargando solicitudes para persona...');
      this.solicitudes =
        await this.vacantes.listarPostulacionesPendientesPersona();
      console.log('Solicitudes cargadas:', this.solicitudes.length);
      if (this.solicitudes.length === 0) {
        // Diagnóstico
        const persona = await this.supa.obtenerPersonaActual();
        if (persona?.id) {
          const servicios = await this.supa.cliente
            .from('vacantes')
            .select('id,titulo')
            .eq('persona_id', persona.id);
          console.log('Servicios de la persona:', servicios.data?.length || 0);
          
          if (servicios.data && servicios.data.length > 0) {
            const servicioIds = servicios.data.map((s: any) => s.id);
            const postulaciones = await this.supa.cliente
              .from('postulaciones')
              .select('id,estado,empresa_id,vacante_id')
              .in('vacante_id', servicioIds)
              .eq('estado', 'creada');
            console.log('Postulaciones encontradas:', postulaciones.data?.length || 0);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      this.solicitudes = [];
    } finally {
      this.cargando = false;
      this.ultimaActualizacion = Date.now();
    }
  }

  async verPerfil(s: any) {
    this.modalAbierto = true;
    const base = s?.empresa || s?.persona || null;
    if (!base?.id) {
      this.perfilSeleccionado = base;
      this.habilidadesSeleccionadas = [];
      return;
    }
    try {
      // Si es empresa
      if (s.empresa && base.id) {
        const e = await this.supa.cliente
          .from('empresas')
          .select(
            'id,auth_user_id,razon_social,nit,representante_legal,correo_corporativo,telefono,ciudad,sector,tamano,sitio_web,logo_url,descripcion,verificado'
          )
          .eq('id', base.id)
          .maybeSingle();
        this.perfilSeleccionado = e.data || base;
        this.habilidadesSeleccionadas = [];
      } 
      // Si es persona
      else if (s.persona && base.id) {
        const p = await this.supa.cliente
          .from('personas')
          .select(
            'id,auth_user_id,nombre_completo,tipo_documento,numero_documento,correo,telefono,ciudad,rol_principal,anos_experiencia,pretension_salarial,disponibilidad,resumen,hoja_vida_url,foto_url,verificado'
          )
          .eq('id', base.id)
          .maybeSingle();
        this.perfilSeleccionado = p.data || base;
        
        // Cargar habilidades
        const hs = await this.supa.cliente
          .from('personas_habilidades')
          .select('nivel, habilidad:habilidad_id(id,nombre)')
          .eq('persona_id', base.id);
        this.habilidadesSeleccionadas = (hs.data || []) as any[];
      } else {
        this.perfilSeleccionado = base;
        this.habilidadesSeleccionadas = [];
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
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
      await this.vacantes.aceptarPostulacionPersona(s.id);
      const alerta = await this.alertas.create({
        header: 'Postulación',
        message: 'Solicitud aceptada. Se abrió el chat con la empresa.',
        buttons: ['OK'],
      });
      await alerta.present();
      await this.cargar();
    } catch (e: any) {
      const msg = String(e?.message || 'No fue posible aceptar');
      const alerta = await this.alertas.create({
        header: 'Error',
        message: msg,
        buttons: ['OK'],
      });
      await alerta.present();
    }
  }

  async renegar(s: any) {
    try {
      await this.vacantes.rechazarPostulacionPersona(s.id);
      const alerta = await this.alertas.create({
        header: 'Postulación',
        message: 'Solicitud rechazada.',
        buttons: ['OK'],
      });
      await alerta.present();
      await this.cargar();
    } catch (e: any) {
      const msg = String(e?.message || 'No fue posible rechazar');
      const alerta = await this.alertas.create({
        header: 'Error',
        message: msg,
        buttons: ['OK'],
      });
      await alerta.present();
    }
  }

  inicial(s: any) {
    if (s?.empresa?.razon_social) {
      const n = String(s.empresa.razon_social).trim();
      return n ? n[0].toUpperCase() : 'E';
    } else if (s?.persona?.nombre_completo) {
      const n = String(s.persona.nombre_completo).trim();
      return n ? n[0].toUpperCase() : 'P';
    }
    return '?';
  }

  nombrePostulante(s: any) {
    if (s?.empresa?.razon_social) {
      return String(s.empresa.razon_social).trim() || 'Empresa';
    } else if (s?.persona?.nombre_completo) {
      return String(s.persona.nombre_completo).trim() || 'Persona';
    }
    return 'Desconocido';
  }

  ngOnDestroy() {
    try {
      this.ch?.unsubscribe();
    } catch {}
  }
}

