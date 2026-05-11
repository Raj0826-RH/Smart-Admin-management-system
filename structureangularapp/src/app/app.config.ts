import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHighcharts } from 'highcharts-angular';

import { routes } from './app.routes';



export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),   // ✅ Required for MatDialog, MatSnackBar, etc.
    provideHighcharts({
      instance: () => import('highcharts'),
      modules: () => [import('highcharts/highcharts-3d')]
    })
  ]
};
