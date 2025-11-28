import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appCurrencyInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputDirective),
      multi: true
    }
  ]
})
export class CurrencyInputDirective implements ControlValueAccessor {
  private el: any;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private rawValue: string = '';

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('ionInput', ['$event'])
  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value || '';
    
    // Remover todo excepto números
    const numbersOnly = value.replace(/[^\d]/g, '');
    
    // Guardar el valor sin formato para el formulario
    this.rawValue = numbersOnly;
    this.onChange(numbersOnly);
    
    // Actualizar la visualización con formato
    this.updateDisplay(numbersOnly);
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
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
      maximumFractionDigits: 0
    });
    
    // Actualizar el valor mostrado
    this.el.value = formatted;
  }

  writeValue(value: string | number | null): void {
    if (value === null || value === undefined || value === '') {
      this.rawValue = '';
      this.el.value = '';
      return;
    }
    
    const strValue = typeof value === 'number' ? value.toString() : value;
    this.rawValue = strValue.replace(/[^\d]/g, '');
    
    if (this.rawValue) {
      this.updateDisplay(this.rawValue);
    } else {
      this.el.value = '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.el.setDisabledState) {
      this.el.setDisabledState(isDisabled);
    } else {
      this.el.disabled = isDisabled;
    }
  }
}

