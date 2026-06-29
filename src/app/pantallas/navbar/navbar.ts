import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Toast } from '../../utils/sweetAlert';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  usuarioLogueado: any = null;

  ngOnInit() {
    this.verificarUsuario();

    this.router.events.subscribe(() => {
      this.verificarUsuario();
    });
  }

  verificarUsuario() {
    const usuarioLocalStorage = localStorage.getItem('usuario');
    if (usuarioLocalStorage) {
      this.usuarioLogueado = JSON.parse(usuarioLocalStorage);
    } else {
      this.usuarioLogueado = null;
    }
    
    
    this.cdr.detectChanges(); 
  }

  logout() {
    localStorage.clear();
    this.usuarioLogueado = null;

    if (this.authService && typeof this.authService.logout === 'function') {
      this.authService.logout();
    }

    this.cdr.detectChanges(); 

    Toast.fire({
      icon: 'success',
      title: '¡Sesión cerrada con éxito!',
      text: 'Te esperamos pronto.'
    });

    this.router.navigate(['/login']);
  }
}