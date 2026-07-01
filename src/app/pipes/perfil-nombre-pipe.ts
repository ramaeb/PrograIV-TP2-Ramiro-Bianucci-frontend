import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'perfilNombre',
  standalone: true
})
export class PerfilNombrePipe implements PipeTransform {
  transform(perfil: string): string {
    switch (perfil?.toLowerCase()) {
      case 'admin': return 'Administrador';
      case 'usuario': return ' Usuario Estándar';
      default: return perfil || 'Desconocido';
    }
  }
}