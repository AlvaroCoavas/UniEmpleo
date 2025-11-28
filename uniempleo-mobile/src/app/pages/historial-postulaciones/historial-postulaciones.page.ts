import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServicioDatosSupabase } from '../../services/supabase.service';

interface PostulacionHistorial {
  id: string;
  tipo: 'vacante' | 'servicio';
  titulo: string;
  empresa?: {
    id: string;
    razon_social: string;
    logo_url?: string;
  };
  estado: string;
  creada_en: string;
  actualizado_en: string;
  vacante_id: string;
}

@Component({
  selector: 'app-historial-postulaciones',
  templateUrl: './historial-postulaciones.page.html',
  styleUrls: ['./historial-postulaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
})
export class PaginaHistorialPostulaciones implements OnInit {
  postulaciones: PostulacionHistorial[] = [];
  cargando = true;
  filtroEstado: string = 'todos';

  constructor(private supabase: ServicioDatosSupabase) {}

  async ngOnInit() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    this.cargando = true;
    try {
      const persona = await this.supabase.obtenerPersonaActual();
      if (!persona?.id) {
        this.postulaciones = [];
        return;
      }

      // 1. Obtener postulaciones a vacantes (donde la persona se postuló)
      const postulacionesVacantes = await this.supabase.cliente
        .from('postulaciones')
        .select(`
          id,
          estado,
          creada_en,
          actualizado_en,
          vacante_id,
          vacantes:vacante_id(
            id,
            titulo,
            empresa_id,
            empresas:empresa_id(
              id,
              razon_social,
              logo_url
            )
          )
        `)
        .eq('persona_id', persona.id)
        .order('creada_en', { ascending: false });

      // 2. Obtener postulaciones a servicios (donde empresas se postularon a servicios de la persona)
      const servicios = await this.supabase.cliente
        .from('vacantes')
        .select('id, titulo, persona_id')
        .eq('persona_id', persona.id);

      let postulacionesServicios: any[] = [];
      if (servicios.data && servicios.data.length > 0) {
        const servicioIds = servicios.data.map((s: any) => s.id);
        const res = await this.supabase.cliente
          .from('postulaciones')
          .select(`
            id,
            estado,
            creada_en,
            actualizado_en,
            vacante_id,
            empresa_id,
            vacantes:vacante_id(
              id,
              titulo,
              persona_id
            ),
            empresas:empresa_id(
              id,
              razon_social,
              logo_url
            )
          `)
          .in('vacante_id', servicioIds)
          .order('creada_en', { ascending: false });

        if (!res.error && res.data) {
          postulacionesServicios = res.data;
        }
      }

      // Procesar postulaciones a vacantes
      const vacantes = (postulacionesVacantes.data || []).map((p: any) => ({
        id: p.id,
        tipo: 'vacante' as const,
        titulo: p.vacantes?.titulo || 'Vacante sin título',
        empresa: p.vacantes?.empresas ? {
          id: p.vacantes.empresas.id,
          razon_social: p.vacantes.empresas.razon_social,
          logo_url: p.vacantes.empresas.logo_url,
        } : undefined,
        estado: p.estado,
        creada_en: p.creada_en,
        actualizado_en: p.actualizado_en,
        vacante_id: p.vacante_id,
      }));

      // Procesar postulaciones a servicios
      const serviciosPostulados = postulacionesServicios.map((p: any) => ({
        id: p.id,
        tipo: 'servicio' as const,
        titulo: p.vacantes?.titulo || 'Servicio sin título',
        empresa: p.empresas ? {
          id: p.empresas.id,
          razon_social: p.empresas.razon_social,
          logo_url: p.empresas.logo_url,
        } : undefined,
        estado: p.estado,
        creada_en: p.creada_en,
        actualizado_en: p.actualizado_en,
        vacante_id: p.vacante_id,
      }));

      // Combinar y ordenar por fecha
      this.postulaciones = [...vacantes, ...serviciosPostulados].sort((a, b) => {
        return new Date(b.creada_en).getTime() - new Date(a.creada_en).getTime();
      });

    } catch (error) {
      console.error('Error al cargar historial:', error);
      this.postulaciones = [];
    } finally {
      this.cargando = false;
    }
  }

  cambiarFiltro(event: any) {
    const valor = event?.detail?.value;
    if (valor) {
      this.filtroEstado = valor;
    }
  }

  get postulacionesFiltradas(): PostulacionHistorial[] {
    if (this.filtroEstado === 'todos') {
      return this.postulaciones;
    }
    if (this.filtroEstado === 'creada') {
      return this.postulaciones.filter(p => p.estado === 'creada');
    }
    return this.postulaciones;
  }

  getColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'creada': 'medium',
      'revision': 'primary',
      'entrevista': 'tertiary',
      'oferta': 'success',
      'rechazada': 'danger',
      'contratada': 'success',
    };
    return colores[estado] || 'medium';
  }

  getTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      'creada': 'Creada',
      'revision': 'En Revisión',
      'entrevista': 'Entrevista',
      'oferta': 'Oferta',
      'rechazada': 'Rechazada',
      'contratada': 'Contratada',
    };
    return textos[estado] || estado;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

