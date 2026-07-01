import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cortarTexto',
  standalone: true
})
export class CortarTextoPipe implements PipeTransform {
  transform(valor: string, limite: number = 50): string {
    if (!valor) return '';
    return valor.length > limite ? valor.substring(0, limite) + '...' : valor;
  }
}