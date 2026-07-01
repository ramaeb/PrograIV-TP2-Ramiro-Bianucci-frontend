import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Toast } from '../../utils/sweetAlert';
import { ChangeDetectorRef } from '@angular/core';
import {TimeTokenService} from '../../services/time-token-service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService); // Cambiado a public para usarlo en el HTML
  private cdr = inject(ChangeDetectorRef);
  public timeTokenService = inject(TimeTokenService);
  usuarioLogueado: any = null;
  esAdmin: boolean = false;
  ngOnInit() {
    this.verificarUsuario();
    this.verificarAdmin();
    this.router.events.subscribe(() => {
      this.verificarUsuario();
    });
  }
  verificarAdmin() {
      // Si el perfil coincide con administrador, cambia a true
      this.esAdmin = this.usuarioLogueado?.perfil === 'admin';
      this.cdr.detectChanges(); 
    }
    
  
  verificarUsuario() {
    const usuarioLocalStorage = localStorage.getItem('usuario');
    if (usuarioLocalStorage) {
      try {
        this.usuarioLogueado = JSON.parse(usuarioLocalStorage);
      } catch (e) {
        this.usuarioLogueado = null;
      }
    } else {
      this.usuarioLogueado = null;
    }
    this.cdr.detectChanges(); 
  }

  logout() {
    this.usuarioLogueado = null;
    this.timeTokenService.forzarLogout(); // Detener el contador de tiempo
    this.authService.logout(); // Centralizado en el servicio

    Toast.fire({
      icon: 'success',
      title: '¡Sesión cerrada con éxito!',
      text: 'Te esperamos pronto.'
    });
  }
}