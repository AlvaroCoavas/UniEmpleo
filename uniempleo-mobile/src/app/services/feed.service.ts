import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServicioFeed {
  async obtenerFeed() {
    const url = `${environment.functionsBaseUrl}/getFeed`;
    const res = await fetch(url);
    return res.json();
  }
}