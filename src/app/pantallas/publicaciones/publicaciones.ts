import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-publicaciones',
  imports: [],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones {
  private router = inject(Router);


  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
