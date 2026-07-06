import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker'; // ◄ 1. Importá esto

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000'
    }),
      provideHttpClient(
        withInterceptors([authInterceptor]) // INTERECEPTOR PARA EL TOKEN
      ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
