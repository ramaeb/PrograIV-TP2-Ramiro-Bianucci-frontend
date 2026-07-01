import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImagenDefecto]', // 👈 Solo se aplica a etiquetas <img>
  standalone: true
})
export class ImagenDefectoDirective {
  // Permite pasar una ruta personalizada por HTML, sino usa la genérica
  @Input() appImagenDefecto?: string;

  constructor(private el: ElementRef) {}

  // Escucha si la imagen falla al cargar
  @HostListener('error')
  interceptarErrorImagen() {
    const imgHtml = this.el.nativeElement;
    
    // Ruta fallback por si falla internet o los assets locales
    const fallback = this.appImagenDefecto || 'assets/default-avatar.png';
    
    if (imgHtml.src !== fallback) {
      imgHtml.src = fallback;
    }
  }
}