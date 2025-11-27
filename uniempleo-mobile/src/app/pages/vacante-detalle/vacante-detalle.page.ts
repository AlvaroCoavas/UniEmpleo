import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ServicioVacantes } from '../../services/vacantes.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-vacante-detalle',
  templateUrl: './vacante-detalle.page.html',
  styleUrls: ['./vacante-detalle.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class PaginaVacanteDetalle implements OnInit {
  vacante: any;
  empresa: any;
  estaPostulando: boolean = false;
  yaPostulado: boolean = false;
  esMiVacante: boolean = false;
  esMiServicio: boolean = false;

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
    if (rol === 'empresa' && this.vacante?.empresaId) {
      const empresa = await this.supabase.obtenerEmpresaActual();
      this.esMiVacante = empresa?.id === this.vacante.empresaId;
    } else if (rol === 'egresado' && this.vacante?.personaId) {
      const persona = await this.supabase.obtenerPersonaActual();
      this.esMiServicio = persona?.id === this.vacante.personaId;
    }
    
    if (this.vacante?.empresaId) {
      this.empresa = await this.supabase
        .obtenerEmpresaPorId(this.vacante.empresaId)
        .catch(() => null);
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
          throw new Error('Solo las personas pueden postularse a vacantes de empresas.');
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
}
