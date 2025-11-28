import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-noticia-card',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './noticia-card.component.html',
  styleUrls: ['./noticia-card.component.scss']
})
export class NoticiaCardComponent {
  @Input() noticia: any;
  @Input() empresaRoute: string[] = [];
}

