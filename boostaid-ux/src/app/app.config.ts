import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled', // it ensures that navigating to a route with a URL fragment (e.g., /page#section2) 
        scrollPositionRestoration: 'enabled'  // Restores the previous scroll position on backward navigation, else sets the position to the anchor if one is provided, or sets the scroll position to [0, 0] (forward navigation).
      })),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch()
    )
  ]
};
