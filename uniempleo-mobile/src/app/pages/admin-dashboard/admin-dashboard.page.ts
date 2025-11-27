import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioAdmin, EstadisticasAdmin } from '../../services/admin.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
})
export class PaginaAdminDashboard implements OnInit {
  estadisticas: EstadisticasAdmin | null = null;
  personas: any[] = [];
  empresas: any[] = [];
  vacantes: any[] = [];
  noticias: any[] = [];
  postulaciones: any[] = [];
  cargando = true;
  pestanaActiva: 'estadisticas' | 'usuarios' | 'vacantes' | 'noticias' | 'postulaciones' = 'estadisticas';

  constructor(
    private admin: ServicioAdmin,
    private supabase: ServicioDatosSupabase,
    private alertas: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando = true;
    try {
      this.estadisticas = await this.admin.obtenerEstadisticas();
      await this.cargarUsuarios();
      await this.cargarVacantes();
      await this.cargarNoticias();
      await this.cargarPostulaciones();
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarUsuarios() {
    this.personas = await this.admin.listarPersonas();
    this.empresas = await this.admin.listarEmpresas();
  }

  async cargarVacantes() {
    this.vacantes = await this.admin.listarVacantes();
  }

  async cargarNoticias() {
    this.noticias = await this.admin.listarNoticias();
  }

  async cargarPostulaciones() {
    this.postulaciones = await this.admin.listarPostulaciones();
  }

  cambiarPestana(event: any) {
    const valor = event?.detail?.value || event;
    this.pestanaActiva = valor;
  }

  async eliminarPersona(persona: any) {
    const alerta = await this.alertas.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar a ${persona.nombre_completo}? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.admin.eliminarPersona(persona.id);
              await this.cargarUsuarios();
              const exito = await this.alertas.create({
                header: 'Éxito',
                message: 'Persona eliminada correctamente',
                buttons: ['OK'],
              });
              await exito.present();
            } catch (error: any) {
              const errorAlerta = await this.alertas.create({
                header: 'Error',
                message: error?.message || 'No se pudo eliminar la persona',
                buttons: ['OK'],
              });
              await errorAlerta.present();
            }
          },
        },
      ],
    });
    await alerta.present();
  }

  async eliminarEmpresa(empresa: any) {
    const alerta = await this.alertas.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar a ${empresa.razon_social}? Esta acción eliminará también todas sus vacantes y noticias.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.admin.eliminarEmpresa(empresa.id);
              await this.cargarUsuarios();
              await this.cargarVacantes();
              await this.cargarNoticias();
              const exito = await this.alertas.create({
                header: 'Éxito',
                message: 'Empresa eliminada correctamente',
                buttons: ['OK'],
              });
              await exito.present();
            } catch (error: any) {
              const errorAlerta = await this.alertas.create({
                header: 'Error',
                message: error?.message || 'No se pudo eliminar la empresa',
                buttons: ['OK'],
              });
              await errorAlerta.present();
            }
          },
        },
      ],
    });
    await alerta.present();
  }

  async eliminarVacante(vacante: any) {
    const alerta = await this.alertas.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar la vacante "${vacante.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.admin.eliminarVacante(vacante.id);
              await this.cargarVacantes();
              const exito = await this.alertas.create({
                header: 'Éxito',
                message: 'Vacante eliminada correctamente',
                buttons: ['OK'],
              });
              await exito.present();
            } catch (error: any) {
              const errorAlerta = await this.alertas.create({
                header: 'Error',
                message: error?.message || 'No se pudo eliminar la vacante',
                buttons: ['OK'],
              });
              await errorAlerta.present();
            }
          },
        },
      ],
    });
    await alerta.present();
  }

  async eliminarNoticia(noticia: any) {
    const alerta = await this.alertas.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar la noticia "${noticia.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.admin.eliminarNoticia(noticia.id);
              await this.cargarNoticias();
              const exito = await this.alertas.create({
                header: 'Éxito',
                message: 'Noticia eliminada correctamente',
                buttons: ['OK'],
              });
              await exito.present();
            } catch (error: any) {
              const errorAlerta = await this.alertas.create({
                header: 'Error',
                message: error?.message || 'No se pudo eliminar la noticia',
                buttons: ['OK'],
              });
              await errorAlerta.present();
            }
          },
        },
      ],
    });
    await alerta.present();
  }

  async eliminarPostulacion(postulacion: any) {
    const alerta = await this.alertas.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar esta postulación?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.admin.eliminarPostulacion(postulacion.id);
              await this.cargarPostulaciones();
              const exito = await this.alertas.create({
                header: 'Éxito',
                message: 'Postulación eliminada correctamente',
                buttons: ['OK'],
              });
              await exito.present();
            } catch (error: any) {
              const errorAlerta = await this.alertas.create({
                header: 'Error',
                message: error?.message || 'No se pudo eliminar la postulación',
                buttons: ['OK'],
              });
              await errorAlerta.present();
            }
          },
        },
      ],
    });
    await alerta.present();
  }

  formatearFecha(fecha: string | Date) {
    if (!fecha) return 'N/A';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

