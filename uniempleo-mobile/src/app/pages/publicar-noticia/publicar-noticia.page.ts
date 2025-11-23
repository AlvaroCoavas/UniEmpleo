import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioNoticias } from '../../services/noticias.service';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { ServicioTrazabilidad } from '../../services/trazabilidad.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-publicar-noticia',
  templateUrl: './publicar-noticia.page.html',
  styleUrls: ['./publicar-noticia.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class PaginaPublicarNoticia {
  formulario = this.fb.group({
    titulo: ['', Validators.required],
    resumen: [''],
    contenido: [''],
    video: [null]
  });
  archivoVideo: File | null = null;

  constructor(
    private fb: FormBuilder,
    private noticias: ServicioNoticias,
    private supabase: ServicioDatosSupabase,
    private trazas: ServicioTrazabilidad,
    private route: ActivatedRoute
  ) {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) this.cargar(id);
  }

  seleccionarVideo(event: any) {
    const f = event.target.files?.[0];
    if (f) this.archivoVideo = f;
  }

  async cargar(id: string) {
    // auditoria_eventos: carga vía servicio para prellenar
    const lista = await this.noticias.listarNoticias();
    const n = lista.find(x => x.id === id);
    if (!n) return;
    this.formulario.patchValue({ titulo: n.titulo, resumen: n.resumen, contenido: n.contenido });
  }

  async enviar() {
    const sesion = await this.supabase.sesionActual();
    const uid = sesion.data.session?.user?.id;
    if (!uid) return;
    const v = this.formulario.value;
    let videoUrl: string | null = null;
    try {
      if (this.archivoVideo) {
        const ruta = `videos/${Date.now()}_${this.archivoVideo.name}`;
        const sub = await this.supabase.subirArchivo('videos', ruta, this.archivoVideo);
        videoUrl = sub.data?.path || null;
      }
    } catch {}
    const existenteId = this.route.snapshot.queryParamMap.get('id');
    const payload = {
      empresaId: uid,
      titulo: v.titulo!,
      resumen: v.resumen || '',
      contenido: v.contenido || '',
    } as any;
    if (videoUrl) payload.video_url = videoUrl;
    if (existenteId) {
      await this.noticias.actualizarNoticia(existenteId, payload);
      await this.trazas.guardarAuditoria(uid, 'editar_noticia', existenteId, { titulo: v.titulo });
    } else {
      const res = await this.noticias.crearNoticia(payload);
      await this.trazas.guardarAuditoria(uid, 'publicar_noticia', (res as any).id || '', { titulo: v.titulo });
    }
    this.formulario.reset();
  }
}
