import { Directive, ElementRef, HostListener, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: 'input[appContadorCaracteres], textarea[appContadorCaracteres]', // textarea
  standalone: true
})
export class ContadorCaracteresDirective {
  private el = inject(ElementRef<HTMLTextAreaElement>);
  private renderer = inject(Renderer2);

  @HostListener('input')
  onInput() {
    const longitud = this.el.nativeElement.value.length;

    // cambia el borde del input, dependeindo la longitud del comentario/texto.
    if (longitud > 200) {
      this.setBorde('border-danger', 'border-warning');
    } else if (longitud > 100) {
      this.setBorde('border-warning', 'border-danger');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'border-warning');
      this.renderer.removeClass(this.el.nativeElement, 'border-danger');
    }
  }

  private setBorde(claseAgregar: string, claseRemover: string) {
    this.renderer.addClass(this.el.nativeElement, claseAgregar);
    this.renderer.removeClass(this.el.nativeElement, claseRemover);
  }
}