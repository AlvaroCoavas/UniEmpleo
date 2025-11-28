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
    contenido: ['']
  });

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
    const existenteId = this.route.snapshot.queryParamMap.get('id');
    const payload = {
      empresaId: uid,
      titulo: v.titulo!,
      resumen: v.resumen || '',
      contenido: v.contenido || '',
    };
    if (existenteId) {
      await this.noticias.actualizarNoticia(existenteId, payload);
      await this.trazas.guardarAuditoria(uid, 'editar_noticia', existenteId, { titulo: v.titulo });
    } else {
      // crearNoticia ya guarda en auditoria_eventos, no necesitamos guardarAuditoria aquí
      await this.noticias.crearNoticia(payload);
    }
    this.formulario.reset();
  }
}
