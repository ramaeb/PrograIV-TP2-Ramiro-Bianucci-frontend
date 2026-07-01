  import { Component, inject, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { Router, RouterModule } from '@angular/router'; 
  import { AuthService } from '../../services/auth-service'; 
  import { ErrorAlert, Toast } from '../../utils/sweetAlert';
  import { ChangeDetectorRef } from '@angular/core';
  import {TimeTokenService} from '../../services/time-token-service';

  @Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule, RouterModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
  })
  export class Login implements OnInit {
    email: string = '';
    clave: string = '';
    cargando: boolean = false; 

    authService = inject(AuthService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private timeTokenService = inject(TimeTokenService);


    ngOnInit() {
      
      if (localStorage.getItem('token')) {
        this.router.navigate(['/publicaciones']);
      }
    }

    logearse(): void {
      if (this.cargando) return;

      console.log('Intentando iniciar sesión con:', this.email, this.clave);
      this.cargando = true; 
      this.cdr.detectChanges();
      this.timeTokenService.iniciarContador();
      this.authService.login(this.email, this.clave).subscribe({
        next: (res: any) => {
          console.log('¡Login exitoso en NestJS!', res);
          this.timeTokenService.iniciarContador();
          if (res.token) {
            localStorage.setItem('token', res.token);
          } else if (res.accessToken) {
            localStorage.setItem('token', res.accessToken); 
          }

        
          const datosUsuario = res.user || res.usuario || res;
          localStorage.setItem('usuario', JSON.stringify(datosUsuario));

          Toast.fire({
            icon: 'success',
            title: '¡Logueado con éxito!'
          });
          
          this.cargando = false; 
          this.cdr.detectChanges();

          // Redirigimos al feed
          this.router.navigate(['/publicaciones']);
        },
        error: (err) => { 
          console.error('Error de autenticación', err);
          this.cargando = false; 
          this.cdr.detectChanges();

          ErrorAlert.fire({
            icon: 'error',
            title: 'Error de logueo',
            text: err.error?.message || 'Credenciales incorrectas o usuario inexistente.'
          });
        }
      });
    }

    /* Login rápido */
    logearseComun(): void {
      this.email = 'testfinal@mail.com'; 
      this.clave = 'Juan123456';       
      console.log('Login rápido: Usuario Común cargado');
      this.logearse();
    }

    logearseAdmin(): void {
      this.email = 'admin@sistema.com';
      this.clave = 'Admin2026';       
      console.log('Login rápido: Administrador cargado');
      this.logearse();
    }
  }