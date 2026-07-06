import { Directive, inject, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode'; // jwt-decode decodifica jwt en frontend...
@Directive({
  selector: '[appSoloAdmin]',
  standalone: true
})
export class VistaSoloAdmin implements OnInit {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit() {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload: any = jwtDecode(token);
        
        // renderizo html cuando el perfil es admin.
        if (payload.perfil === 'admin') {
          this.viewContainer.createEmbeddedView(this.templateRef);
          return;
        }
      } catch (e) {
        console.error('Error decodificando token en directiva', e);
      }
    }
    
    // si no es admin no mostramos.
    this.viewContainer.clear();
  }
}