import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ServicioDatosSupabase } from '../../services/supabase.service';
import { ServicioNoticias } from '../../services/noticias.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.page.html',
  styleUrls: ['./perfil-empresa.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class PaginaPerfilEmpresa implements OnInit {
  empresa: any | undefined;
  correo: string | undefined;
  formulario!: FormGroup;
  guardando = false;
  mensajeError: string | null = null;
  noticias: any[] = [];

  constructor(private supabase: ServicioDatosSupabase, private alertas: AlertController, private fb: FormBuilder, private noticiasService: ServicioNoticias) {
    this.formulario = this.fb.group({
      razon_social: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      sector: ['', [Validators.required]],
      tamano: [''],
      sitio_web: [''],
      telefono: [''],
      descripcion: [''],
    });
  }

  async ngOnInit() {
    const u = await this.supabase.cliente.auth.getUser();
    this.correo = u.data.user?.email || undefined;
    this.empresa = await this.supabase.obtenerEmpresaActual().catch(() => undefined);
    if (this.empresa) {
      this.formulario.patchValue({
        razon_social: this.empresa.razon_social || '',
        ciudad: this.empresa.ciudad || '',
        sector: this.empresa.sector || '',
        tamano: this.empresa.tamano || '',
        sitio_web: this.empresa.sitio_web || '',
        telefono: this.empresa.telefono || '',
        descripcion: this.empresa.descripcion || '',
      });
      const uid = u.data.user?.id as string;
      this.noticias = await this.noticiasService.listarNoticiasPorEmpresa(uid);
    }
  }

  async guardar() {
    if (!this.formulario.valid) return;
    this.mensajeError = null;
    this.guardando = true;
    try {
      const datos = this.formulario.value as any;
      await this.supabase.actualizarEmpresaActual({
        razon_social: datos.razon_social,
        ciudad: datos.ciudad,
        sector: datos.sector,
        tamano: datos.tamano,
        sitio_web: datos.sitio_web,
        telefono: datos.telefono,
        descripcion: datos.descripcion,
      });
      this.empresa = await this.supabase.obtenerEmpresaActual().catch(() => this.empresa);
      const alerta = await this.alertas.create({ header: 'Guardado', message: 'Información de empresa actualizada', buttons: ['OK'] });
      await alerta.present();
      this.formulario.markAsPristine();
    } catch (e: any) {
      this.mensajeError = e?.message || 'No fue posible actualizar la empresa';
    } finally {
      this.guardando = false;
    }
  }

  async cambiarContrasena() {
    if (!this.correo) return;
    await this.supabase.enviarCorreoRecuperacion(this.correo);
    const alerta = await this.alertas.create({ header: 'Recuperación', message: 'Te enviamos un correo para cambiar la contraseña', buttons: ['OK'] });
    await alerta.present();
  }

  async eliminarNoticia(id: string) {
    await this.noticiasService.eliminarNoticia(id);
    const uid = (await this.supabase.cliente.auth.getUser()).data.user?.id as string;
    this.noticias = await this.noticiasService.listarNoticiasPorEmpresa(uid);
  }

  async editarNoticia(n: any) {
    const alerta = await this.alertas.create({
      header: 'Editar noticia',
      inputs: [
        { name: 'titulo', type: 'text', value: n.titulo, placeholder: 'Título' },
        { name: 'resumen', type: 'text', value: n.resumen, placeholder: 'Resumen' },
        { name: 'contenido', type: 'textarea', value: n.contenido, placeholder: 'Contenido' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', role: 'confirm' }
      ]
    });
    await alerta.present();
    const r = await alerta.onDidDismiss();
    if (r.role === 'confirm') {
      const d = r.data?.values || {};
      await this.noticiasService.actualizarNoticia(n.id, { titulo: d.titulo, resumen: d.resumen, contenido: d.contenido });
      const uid = (await this.supabase.cliente.auth.getUser()).data.user?.id as string;
      this.noticias = await this.noticiasService.listarNoticiasPorEmpresa(uid);
    }
  }
}
