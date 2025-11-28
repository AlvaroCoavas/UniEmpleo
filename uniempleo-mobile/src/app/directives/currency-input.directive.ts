import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyInput]',
  standalone: true,
})
export class CurrencyInputDirective {
  private el: any;
  private rawValue: string = '';

  constructor(private elementRef: ElementRef, private ngControl: NgControl) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('ionInput', ['$event'])
  onInput(event: any) {
    const value = (event?.detail?.value ??
      event?.target?.value ??
      '') as string;

    // Remover todo excepto números
    const numbersOnly = value.replace(/[^\d]/g, '');

    // Guardar el valor sin formato para el formulario
    this.rawValue = numbersOnly;
    this.ngControl.control?.setValue(numbersOnly, {
      emitEvent: true,
      emitModelToViewChange: false,
    });

    // Actualizar la visualización con formato
    this.updateDisplay(numbersOnly);
  }

  @HostListener('blur')
  onBlur() {
    // Al perder el foco, mostrar con formato
    this.updateDisplay(this.rawValue);
  }

  @HostListener('focus')
  onFocus() {
    // Al enfocar, mostrar el valor sin formato para facilitar la edición
    if (this.rawValue) {
      this.el.value = this.rawValue;
    }
  }

  private updateDisplay(value: string) {
    if (!value || value === '') {
      this.el.value = '';
      return;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      this.el.value = '';
      return;
    }

    // Formatear con comas
    const formatted = numValue.toLocaleString('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // Actualizar el valor mostrado
    this.el.value = formatted;
  }
}
