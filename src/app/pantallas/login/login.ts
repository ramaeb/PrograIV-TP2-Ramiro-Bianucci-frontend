
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Si usás navegación
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth-service'; // Asegurate de tener un servicio de autenticación
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  // 1. Propiedades vinculadas a los inputs mediante [(ngModel)]
  email: string = '';
  clave: string = '';
  authService = inject(AuthService);
  constructor(private router: Router) {
  }

  /**
   * Método principal de login (Formulario válido)
   */
  logearse(): void {
    // Acá iría la llamada a tu servicio de autenticación (ej: AuthService)
    console.log('Intentando iniciar sesión con:', this.email, this.clave);
    
    this.authService.login(this.email, this.clave).subscribe({
      next: (res) => {
        // Redirigir al home o dashboard
        this.router.navigate(['/home']);
      },
      error: (err) => console.error('Error de autenticación', err)
    });
 
  }

  /*Login rapido*/
  logearseComun(): void {
    this.email = 'usuario_comun'; // O un correo único
    this.clave = 'User1234';       // Cumple: 8 caracteres, 1 mayúscula, 1 número
    
    console.log('Login rápido: Usuario Común cargado');
    this.logearse();
  }

  logearseAdmin(): void {
    this.email = 'admin@sistema.com';
    this.clave = 'Admin2026';       // Cumple: 8 caracteres, 1 mayúscula, 1 número
    
    console.log('Login rápido: Administrador cargado');
    this.logearse();
  }
}