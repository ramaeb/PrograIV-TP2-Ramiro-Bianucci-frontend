import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  imports: [],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  private router = inject(Router);


  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

}
