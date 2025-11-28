import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '';
    }
    
    // Formato mexicano/colombiano: $2,000,000
    return '$' + numValue.toLocaleString('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}


