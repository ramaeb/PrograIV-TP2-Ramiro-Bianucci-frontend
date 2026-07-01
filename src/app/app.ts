import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './pantallas/navbar/navbar';
// 1. Importamos los servicios necesarios
import { AuthService } from './services/auth-service'; 
import { TimeTokenService } from './services/time-token-service'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit { // 2. Implementamos OnInit
  protected readonly title = signal('frontend-redsocial');
  
  // 3. Inyectamos los servicios usando la sintaxis moderna limpia
  private router = inject(Router);
  private authService = inject(AuthService);
  private timeTokenService = inject(TimeTokenService);

  ngOnInit() {
    // 4. Si el token existe en el localStorage al cargar la app (F5), re-activamos el reloj
    if (this.authService.isAuthenticated()) {
      console.log('AppInit: Sesión activa detectada. Re-iniciando temporizador...');
      this.timeTokenService.iniciarContador();
    }
  }

  navegar(ruta: string) {  
    this.router.navigate([ruta]);
  }
}