import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-vacante-detalle',
  templateUrl: './vacante-detalle.page.html',
  styleUrls: ['./vacante-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LoadingStateComponent, CurrencyFormatPipe],
})
export class PaginaVacanteDetalle implements OnInit {
  vacante: any;
  empresa: any;
  persona: any;
  estaPostulando: boolean = false;
  yaPostulado: boolean = false;
  esMiVacante: boolean = false;
  esMiServicio: boolean = false;
  rolActual?: 'empresa' | 'egresado';
  modalAbierto = false;
  perfilCompleto: any | null = null;
  habilidadesSeleccionadas: any[] = [];
  personaRegistrada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private vacantes: ServicioVacantes,
    private supabase: ServicioDatosSupabase,
    private alertas: AlertController
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    if (!id) return;
    this.vacante = await this.vacantes.getVacante(id);

    // Verificar si es mi vacante o servicio
    const rol = await this.supabase.obtenerRolActual();
    this.rolActual = rol as any;
    if (rol === 'empresa' && this.vacante?.empresaId) {
      const empresa = await this.supabase.obtenerEmpresaActual();
      this.esMiVacante = empresa?.id === this.vacante.empresaId;
    } else if (rol === 'egresado') {
      const persona = await this.supabase.obtenerPersonaActual();
      this.personaRegistrada = !!persona?.id;
      if (this.vacante?.personaId) {
        this.esMiServicio = persona?.id === this.vacante.personaId;
      }
    }

    if (this.vacante?.empresaId) {
      this.empresa = await this.supabase
        .obtenerEmpresaPorId(this.vacante.empresaId)
        .catch(() => null);
    }
    if (this.vacante?.personaId) {
      const pr = await this.supabase.cliente
        .from('personas')
        .select('id,auth_user_id,nombre_completo,correo,ciudad,rol_principal,resumen')
        .eq('id', this.vacante.personaId)
        .maybeSingle();
      this.persona = pr.data || null;
    }
    if (this.vacante?.id && !this.esMiVacante && !this.esMiServicio) {
      this.yaPostulado = await this.vacantes
        .yaPostulado(this.vacante.id)
        .catch(() => false);
    }
  }

  async postularme() {
    if (!this.vacante?.id) return;
    this.estaPostulando = true;
    try {
      const rol = await this.supabase.obtenerRolActual();

      // Si es un servicio (tiene persona_id)
      if (this.vacante.personaId) {
        if (rol === 'empresa') {
          // Empresa se postula a servicio de persona
          await this.vacantes.postularServicio(this.vacante.id);
        } else if (rol === 'egresado') {
          // Persona se postula a servicio de otra persona
          await this.vacantes.postularVacante(this.vacante.id);
        } else {
          throw new Error('Debes iniciar sesión para postularte.');
        }
      }
      // Si es una vacante (tiene empresa_id)
      else if (this.vacante.empresaId) {
        if (rol === 'egresado') {
          // Persona se postula a vacante de empresa
          await this.vacantes.postularVacante(this.vacante.id);
        } else {
          throw new Error(
            'Solo las personas pueden postularse a vacantes de empresas.'
          );
        }
      } else {
        throw new Error('No puedes postularte a este tipo de publicación.');
      }

      const alerta = await this.alertas.create({
        header: 'Postulación',
        message: 'Tu postulación fue registrada.',
        buttons: ['OK'],
      });
      await alerta.present();
      this.yaPostulado = true;
    } catch (e: any) {
      const msg = e?.message || 'No se pudo registrar la postulación.';
      const alerta = await this.alertas.create({
        header: 'Error',
        message: String(msg),
        buttons: ['OK'],
      });
      await alerta.present();
    } finally {
      this.estaPostulando = false;
    }
  }

  async verPerfilPersona() {
    if (!this.vacante?.personaId) return;
    try {
      const p = await this.supabase.cliente
        .from('personas')
        .select(
          'id,auth_user_id,nombre_completo,tipo_documento,numero_documento,correo,telefono,ciudad,rol_principal,anos_experiencia,pretension_salarial,disponibilidad,resumen,hoja_vida_url,foto_url'
        )
        .eq('id', this.vacante.personaId)
        .maybeSingle();
      this.perfilCompleto = p.data || null;
      const hs = await this.supabase.cliente
        .from('personas_habilidades')
        .select('nivel, habilidad:habilidad_id(id,nombre)')
        .eq('persona_id', this.vacante.personaId);
      this.habilidadesSeleccionadas = (hs.data || []) as any[];
      this.modalAbierto = true;
    } catch {
      this.perfilCompleto = null;
      this.habilidadesSeleccionadas = [];
      this.modalAbierto = true;
    }
  }

  cerrarPerfil() {
    this.modalAbierto = false;
    this.perfilCompleto = null;
    this.habilidadesSeleccionadas = [];
  }
}
