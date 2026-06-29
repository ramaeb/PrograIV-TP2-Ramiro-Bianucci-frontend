import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './pantallas/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend-redsocial');
   private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  navegar(ruta:string) {  
    this.router.navigate([ruta]);
  }
}
