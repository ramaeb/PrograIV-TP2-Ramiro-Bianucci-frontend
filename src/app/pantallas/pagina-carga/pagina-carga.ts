import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagina-carga.html',
  styleUrl: './pagina-carga.css'
})
export class PaginaCarga implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  //endp
  private apiAuthUrl = 'https://prograiv-tp2-ramiro-bianucci-backend.onrender.com/auth/login';

  ngOnInit() {
    this.validarToken();
  }

  validarToken() {
    const token = localStorage.getItem('token');

    if (!token) {
      setTimeout(() => this.router.navigate(['/login']), 1000); // delay
    }

   
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // ruta de NestJS
    this.http.get(this.apiAuthUrl, { headers }).subscribe({
      next: () => {
        // redirige a publicaciones
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        console.error('Token inválido o expirado:', err);
        
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}