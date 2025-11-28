import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() icon: string = 'document-outline';
  @Input() title: string = 'No hay elementos';
  @Input() message: string = 'No se encontraron elementos para mostrar';
  @Input() actionText?: string;
  @Input() actionIcon?: string;
}


