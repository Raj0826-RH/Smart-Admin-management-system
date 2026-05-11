import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header/header';
import { SidebarComponent } from './shared/sidebar/sidebar';
import { FooterComponent } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('structureangularapp');

  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  showLayout = false;
  isSidebarOpen = true;
  isRouteLoading = false;
  loadingMessage = 'Loading...';

  constructor() {
    this.router.events.subscribe((event: any) => {

      const publicRoutes = ['/login', '/signup', '/verify-otp', '/forgot-password'];

      // Hide layout on public routes
      if (event instanceof NavigationEnd) {
        this.showLayout = !publicRoutes.includes(event.urlAfterRedirects || event.url);
      }

      // Add a fast global loading screen for dashboard route transitions
      if (event instanceof NavigationStart) {
        if (!publicRoutes.some(r => event.url.toLowerCase().includes(r))) {
          this.isRouteLoading = true;

          // Set dynamic message based on target page
          const url = event.url.toLowerCase();
          if (url.includes('dashboard')) {
            this.loadingMessage = 'Loading Dashboard...';
          } else if (url.includes('user')) {
            this.loadingMessage = 'Loading Users...';
          } else if (url.includes('audit')) {
            this.loadingMessage = 'Loading Audits...';
          } else if (url.includes('profile')) {
            this.loadingMessage = 'Loading Profile...';
          } else if (url.includes('campaignmanagement')) {
            this.loadingMessage = 'Loading Campaigns...';
          } else {
            this.loadingMessage = 'Loading...';
          }

          // Set to 600ms - a "sweet spot" that is quick but smooth
          setTimeout(() => {
            this.isRouteLoading = false;
            this.cdr.detectChanges();
          }, 600);
        }
      }

    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}