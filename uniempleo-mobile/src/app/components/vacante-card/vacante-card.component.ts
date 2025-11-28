import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Vacante } from '../../models/vacante';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-vacante-card',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, CurrencyFormatPipe],
  templateUrl: './vacante-card.component.html',
  styleUrls: ['./vacante-card.component.scss']
})
export class VacanteCardComponent {
  @Input() vacante!: Vacante;
  @Input() showActions: boolean = false;
}

