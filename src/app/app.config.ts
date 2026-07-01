import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
      provideHttpClient(
        withInterceptors([authInterceptor]) // INTERECEPTOR PARA EL TOKEN
      ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
