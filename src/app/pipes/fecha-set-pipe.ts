import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha',
  standalone: true // Componente Standalone listo para importar
})
export class FechaSetPipe implements PipeTransform {
  
  transform(fechaString: string, tipo: 'corto' | 'largo' = 'corto'): string {
    if (!fechaString) return 'Sin fecha';

    const fecha = new Date(fechaString + 'T00:00:00');
    
    if (isNaN(fecha.getTime())) return fechaString; // Si no es una fecha válida, devuelve el string original

    if (tipo === 'largo') {
      // Retorna: "24 de septiembre de 2005"
      return fecha.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    // Retorna por defecto "corto": "24/09/2005"
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}