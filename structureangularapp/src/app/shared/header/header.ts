import { Component, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  isProfileMenuOpen = false;
  loggedInUser: string = 'User';

  @Output() sidebarToggled = new EventEmitter<void>();

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarToggled.emit();
  }

  ngOnInit() {
    const stored = localStorage.getItem('username');
    if (stored) this.loggedInUser = stored;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.isProfileMenuOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
